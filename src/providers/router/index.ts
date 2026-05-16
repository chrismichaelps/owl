/**
 * @Owl.Providers.Router - BACKBONE seam coordinator for multi-provider routing
 *
 * The ProviderRouter is a BACKBONE seam (highest capacity, most critical).
 * It coordinates all LLM providers and selects the optimal provider for each task.
 *
 * Routing strategy:
 * 1. Collect capabilities from all registered providers
 * 2. Score each capability against RoutingContext (mode, tokens, reasoning needs)
 * 3. Select highest-scoring capability that fits constraints
 * 4. Return RoutingDecision with selected provider, model, and fallbacks
 *
 * Seam capacity: BACKBONE
 * - This is the highest-traffic seam in the system
 * - Every inference goes through the router
 * - Deepen with 2+ production adapters (multiple providers)
 *
 * @example
 * // Get routing decision
 * const decision = yield* Effect.flatMap(ProviderRouter, (r) =>
 *   r.route({ taskId: "1", mode: "deep", estimatedInputTokens: 8000, ... })
 * )
 * // decision.selectedProvider: "anthropic", decision.selectedModel: "claude-opus-4-7"
 *
 * // Execute inference via router
 * const response = yield* Effect.flatMap(ProviderRouter, (r) =>
 *   r.complete(ctx, { taskId: "1", messages: [...], maxTokens: 8192, ... })
 * )
 */
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  HashSet,
  Layer,
  Option,
  Order,
  Ref,
  Either,
} from "effect"
import * as Stream from "effect/Stream"
import {
  PROVIDER_STREAM_LOG,
  ROUTING_LIMITS,
  STREAM_CHUNK_TYPES,
} from "../../core/constants/index.js"
import {
  ProviderStreamError,
  ProviderUnavailableError,
} from "../../core/errors/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import { rankProviders, scoreProvider } from "./scoring.js"
import type {
  LLMProviderService,
  ProviderCapability,
  RoutingContext,
  RoutingDecision,
  StreamingCallbackResult,
  StreamChunk,
} from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import type { AnyProviderError } from "../types.js"

const providerCapabilities = (
  registry: HashMap.HashMap<string, LLMProviderService>,
): Chunk.Chunk<ProviderCapability> =>
  Chunk.flatMap(Chunk.fromIterable(HashMap.values(registry)), (provider) =>
    Chunk.fromIterable(provider.capabilities),
  )

const capabilityOrder = Order.make<ProviderCapability>((left, right) => {
  const providerDelta = left.providerId.localeCompare(right.providerId)
  if (providerDelta < 0) return -1
  if (providerDelta > 0) return 1

  const modelDelta = left.modelId.localeCompare(right.modelId)
  if (modelDelta < 0) return -1
  if (modelDelta > 0) return 1
  return 0
})

const sortCapabilities = (
  capabilities: Chunk.Chunk<ProviderCapability>,
): Chunk.Chunk<ProviderCapability> => Chunk.sort(capabilities, capabilityOrder)

type StreamUsageAccumulator = Readonly<{
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
  readonly estimatedCostUsd: number
}>

type StreamAccumulator = Readonly<{
  readonly contentChunks: Chunk.Chunk<string>
  readonly emittedChunkCount: number
  readonly usage: StreamUsageAccumulator
}>

const emptyStreamUsage = (): StreamUsageAccumulator =>
  Data.struct({
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: 0,
  })

const emptyStreamAccumulator = (): StreamAccumulator =>
  Data.struct({
    contentChunks: Chunk.empty<string>(),
    emittedChunkCount: 0,
    usage: emptyStreamUsage(),
  })

const appendTextChunk = (
  state: StreamAccumulator,
  content: string,
): StreamAccumulator =>
  Data.struct({
    ...state,
    contentChunks: Chunk.append(state.contentChunks, content),
    emittedChunkCount: state.emittedChunkCount + 1,
  })

const recordUsage = (
  state: StreamAccumulator,
  usage: NonNullable<StreamChunk["usage"]>,
): StreamAccumulator =>
  Data.struct({
    ...state,
    usage: Data.struct({
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
      estimatedCostUsd: usage.estimatedCostUsd,
    }),
  })

const runStreamCallback = (
  provider: string,
  callback: () => void,
): Effect.Effect<void, ProviderStreamError> =>
  Effect.try({
    try: callback,
    catch: (cause) => new ProviderStreamError({ provider, cause }),
  })

const handleStreamChunk = (
  provider: string,
  chunk: StreamChunk,
  accumulatorRef: Ref.Ref<StreamAccumulator>,
  onChunk: (text: string) => void,
  onLog?: (msg: string) => void,
): Effect.Effect<void, ProviderStreamError> => {
  if (chunk.type === STREAM_CHUNK_TYPES.TEXT && chunk.content != null) {
    const content = chunk.content
    return Ref.update(accumulatorRef, (state) =>
      appendTextChunk(state, content),
    ).pipe(
      Effect.flatMap(() =>
        runStreamCallback(provider, () => {
          onChunk(content)
        }),
      ),
    )
  }

  if (chunk.type === STREAM_CHUNK_TYPES.USAGE && chunk.usage != null) {
    const usage = chunk.usage
    return Ref.update(accumulatorRef, (state) => recordUsage(state, usage))
  }

  if (onLog == null) {
    return Effect.void
  }

  const logMessage = formatStreamEventLog(chunk)
  return logMessage === null
    ? Effect.void
    : runStreamCallback(provider, () => {
        onLog(logMessage)
      })
}

/**
 * @Owl.Providers.Router.Service - Coordinator interface for multi-provider strategies
 */
export interface ProviderRouterService {
  /**
   * Determine best provider/model for a task
   *
   * @param ctx - RoutingContext with task constraints
   * @returns RoutingDecision with selected provider, model, fallbacks
   * @throws ProviderUnavailableError - No providers available or match constraints
   */
  readonly route: (
    ctx: RoutingContext,
  ) => Effect.Effect<RoutingDecision, ProviderUnavailableError>

  /**
   * Execute inference via the selected provider
   *
   * Internally calls route() to select provider, then delegates to that provider.
   *
   * @param ctx - RoutingContext for provider selection
   * @param request - InferenceRequest without model (router adds it)
   * @returns InferenceResponse from selected provider
   */
  readonly complete: (
    ctx: RoutingContext,
    request: Omit<InferenceRequest, "model">,
  ) => Effect.Effect<
    InferenceResponse,
    AnyProviderError | ProviderUnavailableError
  >

  /**
   * Execute streaming Inference via selected provider, delivering chunks via callback
   *
   * Internally calls route() to select provider, then streams via provider.stream().
   * Calls onChunk for each text chunk as it arrives; returns assembled result on completion.
   * Calls onLog for non-text events like tool calls (optional).
   *
   * @param ctx - RoutingContext for provider selection
   * @param request - InferenceRequest without model (router adds it)
   * @param onChunk - Callback invoked for each text chunk during Streaming
   * @param onLog - Optional callback for non-text events (tool calls, etc.)
   * @returns StreamingCallbackResult with full content and metadata
   */
  readonly completeWithCallback: (
    ctx: RoutingContext,
    request: Omit<InferenceRequest, "model">,
    onChunk: (text: string) => void,
    onLog?: (msg: string) => void,
  ) => Effect.Effect<
    StreamingCallbackResult,
    AnyProviderError | ProviderUnavailableError
  >

  /**
   * List all registered provider IDs
   *
   * @returns Array of provider IDs
   */
  readonly listProviders: () => Effect.Effect<readonly string[]>

  /**
   * List all registered provider model capabilities
   *
   * @returns Sorted array of ProviderCapability records
   */
  readonly listCapabilities: () => Effect.Effect<readonly ProviderCapability[]>
}

/** @Owl.Providers.Router.Adapter - Effect-TS service definition */
export class ProviderRouter extends Context.Tag("ProviderRouter")<
  ProviderRouter,
  ProviderRouterService
>() {}

/**
 * @Owl.Providers.Router.Register - Provider registration helper
 *
 * Called during layer composition to register a provider with the router.
 * The router maintains an internal registry of all providers.
 *
 * @example
 * const router = yield* ProviderRouter
 * yield* registerProvider(router, OpenAIAdapterLive)
 */
export const registerProvider = (
  router: ProviderRouterService,
  provider: LLMProviderService,
): Effect.Effect<void> =>
  Effect.sync(() => {
    ;(
      router as unknown as { _register: (p: LLMProviderService) => void }
    )._register(provider)
  })

/** @Owl.Providers.Router.StreamLog - Formats non-text stream events for TUI logs */
export function formatStreamEventLog(chunk: StreamChunk): string | null {
  if (chunk.content == null) {
    return null
  }

  const preview =
    chunk.content.length > PROVIDER_STREAM_LOG.PREVIEW_CHARS
      ? chunk.content.slice(0, PROVIDER_STREAM_LOG.PREVIEW_CHARS) + "…"
      : chunk.content

  if (chunk.type === STREAM_CHUNK_TYPES.THINKING) {
    return PROVIDER_STREAM_LOG.THINKING_PREFIX + ": " + preview
  }

  if (chunk.type === STREAM_CHUNK_TYPES.TOOL_USE) {
    return PROVIDER_STREAM_LOG.TOOL_PREFIX + ": " + preview
  }

  return null
}

/**
 * @Owl.Providers.Router.Implementation - BACKBONE seam logic
 *
 * Maintains a provider registry and routes requests using the scoring algorithm.
 */
export const ProviderRouterLive = Layer.effect(
  ProviderRouter,
  Effect.gen(function* () {
    /** @Owl.Providers.Router.Registry - In-memory provider registry */
    const registryRef = yield* Ref.make<
      HashMap.HashMap<string, LLMProviderService>
    >(HashMap.empty())

    const route = (
      ctx: RoutingContext,
    ): Effect.Effect<RoutingDecision, ProviderUnavailableError> =>
      Effect.gen(function* () {
        const ranked = yield* rankedCapabilities(ctx)
        const best = Option.getOrUndefined(Chunk.head(ranked))

        if (best === undefined) {
          return yield* Effect.fail(
            new ProviderUnavailableError({
              provider: ctx.preferredProvider ?? "any",
              reason: "No providers registered or none match context",
            }),
          )
        }

        let seenFallbacks = HashSet.empty<string>()
        let fallbacks = Chunk.empty<string>()
        for (const capability of Chunk.drop(ranked, 1)) {
          if (
            capability.providerId === best.providerId ||
            HashSet.has(seenFallbacks, capability.providerId) ||
            Chunk.size(fallbacks) >= ROUTING_LIMITS.FALLBACK_PROVIDER_LIMIT
          ) {
            continue
          }
          seenFallbacks = HashSet.add(seenFallbacks, capability.providerId)
          fallbacks = Chunk.append(fallbacks, capability.providerId)
        }

        const estimatedCost = estimateCapabilityCostUsd(
          best,
          ctx.estimatedInputTokens,
          0,
        )

        return {
          selectedProvider: best.providerId,
          selectedModel: best.modelId,
          score: scoreProvider(best, ctx),
          fallbackProviders: Chunk.toReadonlyArray(fallbacks),
          reasoning: `Selected ${best.modelId} for ${ctx.mode} mode`,
          estimatedCostUsd: estimatedCost,
        } satisfies RoutingDecision
      })

    const rankedCapabilities = (
      ctx: RoutingContext,
    ): Effect.Effect<
      Chunk.Chunk<ProviderCapability>,
      ProviderUnavailableError
    > =>
      Ref.get(registryRef).pipe(
        Effect.flatMap((registry) => {
          const ranked = Chunk.fromIterable(
            rankProviders(
              Chunk.toReadonlyArray(providerCapabilities(registry)),
              ctx,
            ),
          )

          return !Chunk.isEmpty(ranked)
            ? Effect.succeed(ranked)
            : Effect.fail(
                new ProviderUnavailableError({
                  provider: ctx.preferredProvider ?? "any",
                  reason: "No providers registered or none match context",
                }),
              )
        }),
      )

    const missingProvider = (providerId: string): ProviderUnavailableError =>
      new ProviderUnavailableError({
        provider: providerId,
        reason: "Provider registered in routing but not in registry",
      })

    const failLast = <E>(
      error: E | undefined,
      ctx: RoutingContext,
    ): Effect.Effect<never, E | ProviderUnavailableError> =>
      error === undefined
        ? Effect.fail(
            new ProviderUnavailableError({
              provider: ctx.preferredProvider ?? "any",
              reason: "No provider attempts were available",
            }),
          )
        : Effect.fail(error)

    const complete = (
      ctx: RoutingContext,
      request: Omit<InferenceRequest, "model">,
    ): Effect.Effect<
      InferenceResponse,
      AnyProviderError | ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const ranked = yield* rankedCapabilities(ctx)
        const registry = yield* Ref.get(registryRef)
        let lastError: AnyProviderError | ProviderUnavailableError | undefined =
          undefined

        for (const capability of ranked) {
          const provider = Option.getOrUndefined(
            HashMap.get(registry, capability.providerId),
          )

          if (provider === undefined) {
            lastError = missingProvider(capability.providerId)
            continue
          }

          const result = yield* provider
            .complete({
              ...request,
              model: capability.modelId,
            })
            .pipe(Effect.either)

          if (Either.isRight(result)) {
            return {
              ...result.right,
              usage: {
                ...result.right.usage,
                estimatedCostUsd: estimateCapabilityCostUsd(
                  capability,
                  result.right.usage.inputTokens,
                  result.right.usage.outputTokens,
                ),
              },
            }
          }

          lastError = result.left
        }

        return yield* failLast(lastError, ctx)
      })

    const completeWithCallback = (
      ctx: RoutingContext,
      request: Omit<InferenceRequest, "model">,
      onChunk: (text: string) => void,
      onLog?: (msg: string) => void,
    ): Effect.Effect<
      StreamingCallbackResult,
      AnyProviderError | ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const startMs = Date.now()
        const ranked = yield* rankedCapabilities(ctx)
        const registry = yield* Ref.get(registryRef)
        let lastError: AnyProviderError | ProviderUnavailableError | undefined =
          undefined

        for (const capability of ranked) {
          const provider = Option.getOrUndefined(
            HashMap.get(registry, capability.providerId),
          )

          if (provider === undefined) {
            lastError = missingProvider(capability.providerId)
            continue
          }

          const accumulatorRef = yield* Ref.make(emptyStreamAccumulator())
          const result = yield* provider
            .stream({ ...request, model: capability.modelId })
            .pipe(
              Stream.mapChunks((streamChunks) => streamChunks),
              Stream.runForEachChunk((streamChunks) =>
                Effect.forEach(
                  streamChunks,
                  (chunk) =>
                    handleStreamChunk(
                      capability.providerId,
                      chunk,
                      accumulatorRef,
                      onChunk,
                      onLog,
                    ),
                  { discard: true },
                ),
              ),
              Effect.either,
            )

          if (Either.isRight(result)) {
            const accumulator = yield* Ref.get(accumulatorRef)
            const content = Chunk.toReadonlyArray(
              accumulator.contentChunks,
            ).join("")
            return {
              content,
              provider: capability.providerId,
              model: capability.modelId,
              latencyMs: Date.now() - startMs,
              inputTokens: accumulator.usage.inputTokens,
              outputTokens: accumulator.usage.outputTokens,
              cacheReadTokens: accumulator.usage.cacheReadTokens,
              cacheWriteTokens: accumulator.usage.cacheWriteTokens,
              estimatedCostUsd: estimateCapabilityCostUsd(
                capability,
                accumulator.usage.inputTokens,
                accumulator.usage.outputTokens,
              ),
            } satisfies StreamingCallbackResult
          }

          lastError = result.left
          const failedAccumulator = yield* Ref.get(accumulatorRef)
          if (failedAccumulator.emittedChunkCount > 0) {
            return yield* Effect.fail(result.left)
          }
        }

        return yield* failLast(lastError, ctx)
      })

    const listProviders = (): Effect.Effect<readonly string[]> =>
      Ref.get(registryRef).pipe(
        Effect.map((registry) =>
          Chunk.toReadonlyArray(Chunk.fromIterable(HashMap.keys(registry))),
        ),
      )

    const listCapabilities = (): Effect.Effect<readonly ProviderCapability[]> =>
      Ref.get(registryRef).pipe(
        Effect.map((registry) =>
          Chunk.toReadonlyArray(
            sortCapabilities(providerCapabilities(registry)),
          ),
        ),
      )

    const service: ProviderRouterService & {
      _register: (p: LLMProviderService) => void
    } = {
      route,
      complete,
      completeWithCallback,
      listProviders,
      listCapabilities,
      _register: (provider) => {
        Effect.runSync(
          Ref.update(registryRef, (m) => {
            return HashMap.set(m, provider.id, provider)
          }),
        )
      },
    }

    return service
  }),
)

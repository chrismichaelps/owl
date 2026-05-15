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
import { Context, Effect, Layer, Ref } from "effect"
import * as Stream from "effect/Stream"
import { ROUTING_LIMITS } from "../../core/constants/index.js"
import { ProviderUnavailableError } from "../../core/errors/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import { rankProviders, scoreProvider } from "./scoring.js"
import type {
  LLMProviderService,
  ProviderCapability,
  RoutingContext,
  RoutingDecision,
  StreamingCallbackResult,
} from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import type { AnyProviderError } from "../types.js"

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
   *
   * @param ctx - RoutingContext for provider selection
   * @param request - InferenceRequest without model (router adds it)
   * @param onChunk - Callback invoked for each text chunk during Streaming
   * @returns StreamingCallbackResult with full content and metadata
   */
  readonly completeWithCallback: (
    ctx: RoutingContext,
    request: Omit<InferenceRequest, "model">,
    onChunk: (text: string) => void,
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

/**
 * @Owl.Providers.Router.Implementation - BACKBONE seam logic
 *
 * Maintains a provider registry and routes requests using the scoring algorithm.
 */
export const ProviderRouterLive = Layer.effect(
  ProviderRouter,
  Effect.gen(function* () {
    /** @Owl.Providers.Router.Registry - In-memory provider registry */
    const registryRef = yield* Ref.make<Map<string, LLMProviderService>>(
      new Map(),
    )

    const route = (
      ctx: RoutingContext,
    ): Effect.Effect<RoutingDecision, ProviderUnavailableError> =>
      Effect.gen(function* () {
        const ranked = yield* rankedCapabilities(ctx)
        const best = ranked[0]

        if (best === undefined) {
          return yield* Effect.fail(
            new ProviderUnavailableError({
              provider: ctx.preferredProvider ?? "any",
              reason: "No providers registered or none match context",
            }),
          )
        }

        const fallbacks = Array.from(
          new Set(
            ranked
              .slice(1)
              .filter((capability) => capability.providerId !== best.providerId)
              .map((capability) => capability.providerId),
          ),
        ).slice(0, ROUTING_LIMITS.FALLBACK_PROVIDER_LIMIT)

        const estimatedCost = estimateCapabilityCostUsd(
          best,
          ctx.estimatedInputTokens,
          0,
        )

        return {
          selectedProvider: best.providerId,
          selectedModel: best.modelId,
          score: scoreProvider(best, ctx),
          fallbackProviders: fallbacks,
          reasoning: `Selected ${best.modelId} for ${ctx.mode} mode`,
          estimatedCostUsd: estimatedCost,
        } satisfies RoutingDecision
      })

    const rankedCapabilities = (
      ctx: RoutingContext,
    ): Effect.Effect<readonly ProviderCapability[], ProviderUnavailableError> =>
      Ref.get(registryRef).pipe(
        Effect.flatMap((registry) => {
          const capabilities = Array.from(registry.values()).flatMap(
            (provider) => provider.capabilities,
          )
          const ranked = rankProviders(capabilities, ctx)

          return ranked.length > 0
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
          const provider = registry.get(capability.providerId)

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

          if (result._tag === "Right") {
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
          const provider = registry.get(capability.providerId)

          if (provider === undefined) {
            lastError = missingProvider(capability.providerId)
            continue
          }

          const chunks: string[] = []
          let emittedChunks = 0
          let inputTokens = 0
          let outputTokens = 0
          let cacheReadTokens = 0
          let cacheWriteTokens = 0
          const result = yield* Stream.runForEach(
            provider.stream({ ...request, model: capability.modelId }),
            (chunk) =>
              Effect.sync(() => {
                if (chunk.type === "text" && chunk.content != null) {
                  chunks.push(chunk.content)
                  emittedChunks += 1
                  onChunk(chunk.content)
                } else if (chunk.type === "usage" && chunk.usage != null) {
                  inputTokens = chunk.usage.inputTokens
                  outputTokens = chunk.usage.outputTokens
                  cacheReadTokens = chunk.usage.cacheReadTokens
                  cacheWriteTokens = chunk.usage.cacheWriteTokens
                }
              }),
          ).pipe(Effect.either)

          if (result._tag === "Right") {
            return {
              content: chunks.join(""),
              provider: capability.providerId,
              model: capability.modelId,
              latencyMs: Date.now() - startMs,
              inputTokens,
              outputTokens,
              cacheReadTokens,
              cacheWriteTokens,
              estimatedCostUsd: estimateCapabilityCostUsd(
                capability,
                inputTokens,
                outputTokens,
              ),
            } satisfies StreamingCallbackResult
          }

          lastError = result.left
          if (emittedChunks > 0) {
            return yield* Effect.fail(result.left)
          }
        }

        return yield* failLast(lastError, ctx)
      })

    const listProviders = (): Effect.Effect<readonly string[]> =>
      Ref.get(registryRef).pipe(
        Effect.map((registry) => Array.from(registry.keys())),
      )

    const service: ProviderRouterService & {
      _register: (p: LLMProviderService) => void
    } = {
      route,
      complete,
      completeWithCallback,
      listProviders,
      _register: (provider) => {
        Effect.runSync(
          Ref.update(registryRef, (m) => {
            const next = new Map(m)
            next.set(provider.id, provider)
            return next
          }),
        )
      },
    }

    return service
  }),
)

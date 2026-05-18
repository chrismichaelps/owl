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
import { Chunk, Context, Effect, Layer, Ref } from "effect"
import { ROUTING_LIMITS } from "../../core/constants/index.js"
import { providerCapabilities } from "./capabilities.js"
import { rankProviders } from "./scoring.js"
import {
  completeFromRankedProviders,
  failLast,
  missingProvider,
  streamFromRankedProviders,
  type ProviderAttemptRecorder,
} from "./execution.js"
import {
  attemptParallelComplete,
  collectParallelSuccesses,
  lastParallelError,
  resolveParallelProviderLimit,
} from "./parallel.js"
import { makeNoProviderError, makeRoutingDecision } from "./selection.js"
import {
  listProviderCapabilities,
  listProviderIds,
  makeProviderRegistryRef,
  registerProviderInRef,
} from "./registry.js"
import {
  makeProviderReliabilityRef,
  providerReliabilitySnapshot,
  providerReliabilityScores,
  recordProviderFailure,
  recordProviderSuccess,
  type ProviderReliabilityStatus,
} from "./reliability.js"
import { checkProviderHealth, type ProviderHealthStatus } from "./health.js"
import type { ProviderUnavailableError } from "../../core/errors/index.js"
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

export { formatStreamEventLog } from "./streaming.js"
export type { ProviderHealthStatus } from "./health.js"
export type { ProviderReliabilityStatus } from "./reliability.js"

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
   * Execute inference against multiple ranked providers concurrently
   *
   * Used for model comparison and high-confidence workflows. The router preserves
   * ranked order in the returned successes while isolating failed providers.
   *
   * @param ctx - RoutingContext for provider selection
   * @param request - InferenceRequest without model (router adds it)
   * @param maxProviders - Optional cap, bounded by centralized routing limits
   * @returns Successful InferenceResponses in deterministic ranked order
   */
  readonly completeParallel: (
    ctx: RoutingContext,
    request: Omit<InferenceRequest, "model">,
    maxProviders?: number,
  ) => Effect.Effect<
    readonly InferenceResponse[],
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
   * @returns Chunk of provider IDs
   */
  readonly listProviders: () => Effect.Effect<Chunk.Chunk<string>>

  /**
   * List all registered provider model capabilities
   *
   * @returns Sorted Chunk of ProviderCapability records
   */
  readonly listCapabilities: () => Effect.Effect<
    Chunk.Chunk<ProviderCapability>
  >

  /**
   * List provider reliability observations collected during this session
   *
   * @returns Sorted provider reliability rows. Empty until providers are attempted.
   */
  readonly listReliability: () => Effect.Effect<
    Chunk.Chunk<ProviderReliabilityStatus>
  >

  /**
   * Run health checks for all registered providers
   *
   * @returns Sorted provider health statuses. Provider failures are captured
   * as data so observability commands can render partial system health.
   */
  readonly checkHealth: () => Effect.Effect<Chunk.Chunk<ProviderHealthStatus>>
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
    const registryRef = yield* makeProviderRegistryRef()
    const reliabilityRef = yield* makeProviderReliabilityRef()
    const attemptRecorder: ProviderAttemptRecorder = {
      onSuccess: (providerId) =>
        recordProviderSuccess(reliabilityRef, providerId),
      onFailure: (providerId) =>
        recordProviderFailure(reliabilityRef, providerId),
    }

    const route = (
      ctx: RoutingContext,
    ): Effect.Effect<RoutingDecision, ProviderUnavailableError> =>
      Effect.gen(function* () {
        const ranked = yield* rankedCapabilities(ctx)
        return yield* makeRoutingDecision(ctx, ranked)
      })

    const rankedCapabilities = (
      ctx: RoutingContext,
    ): Effect.Effect<
      Chunk.Chunk<ProviderCapability>,
      ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const registry = yield* Ref.get(registryRef)
        const reliabilityScores =
          yield* providerReliabilityScores(reliabilityRef)
        const ranked = Chunk.fromIterable(
          rankProviders(
            Chunk.toReadonlyArray(providerCapabilities(registry)),
            ctx,
            reliabilityScores,
          ),
        )

        return !Chunk.isEmpty(ranked)
          ? ranked
          : yield* Effect.fail(
              makeNoProviderError(
                ctx,
                "No providers registered or none match context",
              ),
            )
      })

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
        return yield* completeFromRankedProviders(
          ranked,
          registry,
          request,
          ctx,
          attemptRecorder,
        )
      })

    const completeParallel = (
      ctx: RoutingContext,
      request: Omit<InferenceRequest, "model">,
      maxProviders: number = ROUTING_LIMITS.PARALLEL_PROVIDER_LIMIT,
    ): Effect.Effect<
      readonly InferenceResponse[],
      AnyProviderError | ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const ranked = yield* rankedCapabilities(ctx)
        const registry = yield* Ref.get(registryRef)
        const providerLimit = resolveParallelProviderLimit(maxProviders)
        const attempts = Chunk.take(ranked, providerLimit)

        const results = yield* Effect.forEach(
          attempts,
          (capability) =>
            attemptParallelComplete(
              registry,
              capability,
              request,
              missingProvider,
              attemptRecorder,
            ),
          { concurrency: providerLimit },
        )
        const successes = collectParallelSuccesses(results)

        if (!Chunk.isEmpty(successes)) {
          return Chunk.toReadonlyArray(successes)
        }

        return yield* failLast(lastParallelError(results), ctx)
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
        const ranked = yield* rankedCapabilities(ctx)
        const registry = yield* Ref.get(registryRef)
        return yield* streamFromRankedProviders(
          ranked,
          registry,
          request,
          ctx,
          onChunk,
          onLog,
          attemptRecorder,
        )
      })

    const service: ProviderRouterService & {
      _register: (p: LLMProviderService) => void
    } = {
      route,
      complete,
      completeParallel,
      completeWithCallback,
      listProviders: () => listProviderIds(registryRef),
      listCapabilities: () => listProviderCapabilities(registryRef),
      listReliability: () => providerReliabilitySnapshot(reliabilityRef),
      checkHealth: () => checkProviderHealth(registryRef),
      _register: (provider) => {
        registerProviderInRef(registryRef, provider)
      },
    }

    return service
  }),
)

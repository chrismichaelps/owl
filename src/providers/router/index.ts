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
import { ProviderUnavailableError } from "../../core/errors/index.js"
import { selectBestProvider } from "./scoring.js"
import type {
  LLMProviderService,
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
        const registry = yield* Ref.get(registryRef)
        const allCapabilities = Array.from(registry.values()).flatMap(
          (p) => p.capabilities,
        )

        const best = selectBestProvider(allCapabilities, ctx)

        if (best === null) {
          return yield* Effect.fail(
            new ProviderUnavailableError({
              provider: ctx.preferredProvider ?? "any",
              reason: "No providers registered or none match context",
            }),
          )
        }

        const fallbacks = allCapabilities
          .filter((c) => c.modelId !== best.modelId)
          .map((c) => c.providerId)
          .slice(0, 2)

        const estimatedCost =
          (ctx.estimatedInputTokens / 1000) * best.inputCostPer1k

        return {
          selectedProvider: best.providerId,
          selectedModel: best.modelId,
          score: 0.8,
          fallbackProviders: fallbacks,
          reasoning: `Selected ${best.modelId} for ${ctx.mode} mode`,
          estimatedCostUsd: estimatedCost,
        } satisfies RoutingDecision
      })

    const complete = (
      ctx: RoutingContext,
      request: Omit<InferenceRequest, "model">,
    ): Effect.Effect<
      InferenceResponse,
      AnyProviderError | ProviderUnavailableError
    > =>
      Effect.gen(function* () {
        const decision = yield* route(ctx)
        const registry = yield* Ref.get(registryRef)
        const provider = registry.get(decision.selectedProvider)

        if (!provider) {
          return yield* Effect.fail(
            new ProviderUnavailableError({
              provider: decision.selectedProvider,
              reason: "Provider registered in routing but not in registry",
            }),
          )
        }

        return yield* provider.complete({
          ...request,
          model: decision.selectedModel,
        })
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
        const decision = yield* route(ctx)
        const registry = yield* Ref.get(registryRef)
        const provider = registry.get(decision.selectedProvider)

        if (!provider) {
          return yield* Effect.fail(
            new ProviderUnavailableError({
              provider: decision.selectedProvider,
              reason: "Provider registered in routing but not in registry",
            }),
          )
        }

        const chunks: string[] = []
        yield* Stream.runForEach(
          provider.stream({ ...request, model: decision.selectedModel }),
          (chunk) =>
            Effect.sync(() => {
              if (chunk.type === "text" && chunk.content != null) {
                chunks.push(chunk.content)
                onChunk(chunk.content)
              }
            }),
        )

        return {
          content: chunks.join(""),
          provider: decision.selectedProvider,
          model: decision.selectedModel,
          latencyMs: Date.now() - startMs,
        } satisfies StreamingCallbackResult
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

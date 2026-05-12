/** @Owl.Providers.Router - BACKBONE seam coordinator for multi-provider routing */
import { Context, Effect, Layer, Ref } from "effect"
import { ProviderUnavailableError } from "../../core/errors/index.js"
import { selectBestProvider } from "./scoring.js"
import type {
  LLMProviderService,
  RoutingContext,
  RoutingDecision,
} from "../types.js"
import type { InferenceRequest, InferenceResponse } from "../../core/schema/index.js"
import type { AnyProviderError } from "../types.js"

export interface ProviderRouterService {
  readonly route: (
    ctx: RoutingContext,
  ) => Effect.Effect<RoutingDecision, ProviderUnavailableError>

  readonly complete: (
    ctx: RoutingContext,
    request: Omit<InferenceRequest, "model">,
  ) => Effect.Effect<InferenceResponse, AnyProviderError | ProviderUnavailableError>

  readonly listProviders: () => Effect.Effect<readonly string[]>
}

export class ProviderRouter extends Context.Tag("ProviderRouter")<
  ProviderRouter,
  ProviderRouterService
>() { }

export const registerProvider = (
  router: ProviderRouterService,
  provider: LLMProviderService,
): Effect.Effect<void> =>
  Effect.sync(() => {
    ; (router as unknown as { _register: (p: LLMProviderService) => void })._register(provider)
  })

export const ProviderRouterLive = Layer.effect(
  ProviderRouter,
  Effect.gen(function* () {
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
    ): Effect.Effect<InferenceResponse, AnyProviderError | ProviderUnavailableError> =>
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

    const listProviders = (): Effect.Effect<readonly string[]> =>
      Ref.get(registryRef).pipe(
        Effect.map((registry) => Array.from(registry.keys())),
      )

    const service: ProviderRouterService & {
      _register: (p: LLMProviderService) => void
    } = {
      route,
      complete,
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

/** @Owl.Providers.Router.Selection - Ranked provider decision helpers */
import { Chunk, Data, Effect, HashSet, Option } from "effect"
import { ROUTING_LIMITS } from "../../core/constants/index.js"
import { ProviderUnavailableError } from "../../core/errors/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import { scoreProvider } from "./scoring.js"
import type {
  ProviderCapability,
  RoutingContext,
  RoutingDecision,
} from "../types.js"

export const makeNoProviderError = (
  ctx: RoutingContext,
  reason: string,
): ProviderUnavailableError =>
  new ProviderUnavailableError({
    provider: ctx.preferredProvider ?? "any",
    reason,
  })

const fallbackProvidersFor = (
  best: ProviderCapability,
  ranked: Chunk.Chunk<ProviderCapability>,
): readonly string[] => {
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
  return Chunk.toReadonlyArray(fallbacks)
}

export const makeRoutingDecision = (
  ctx: RoutingContext,
  ranked: Chunk.Chunk<ProviderCapability>,
): Effect.Effect<RoutingDecision, ProviderUnavailableError> =>
  Effect.gen(function* () {
    const best = Option.getOrUndefined(Chunk.head(ranked))

    if (best === undefined) {
      return yield* Effect.fail(
        makeNoProviderError(
          ctx,
          "No providers registered or none match context",
        ),
      )
    }

    return Data.struct({
      selectedProvider: best.providerId,
      selectedModel: best.modelId,
      score: scoreProvider(best, ctx),
      fallbackProviders: fallbackProvidersFor(best, ranked),
      reasoning: `Selected ${best.modelId} for ${ctx.mode} mode`,
      estimatedCostUsd: estimateCapabilityCostUsd(
        best,
        ctx.estimatedInputTokens,
        0,
      ),
    })
  })

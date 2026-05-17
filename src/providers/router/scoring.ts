/**
 * @Owl.Providers.Router.Scoring - Provider selection scoring algorithm
 *
 * Scores Provider capabilities against a RoutingContext using centralized
 * routing constants and Effect immutable collections.
 */
import { Chunk, Data, HashMap, HashSet, Option, Order } from "effect"
import {
  LOCAL_PROVIDER_ID_SET,
  ROUTING_LIMITS,
  ROUTING_MODE_REASONING_DEMAND,
  ROUTING_REASONING_SCORES,
  ROUTING_SCORE_DEFAULTS,
  ROUTING_WEIGHTS,
} from "../../core/constants/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import type { ProviderCapability, RoutingContext } from "../types.js"

/** @Owl.Providers.Router.Scoring.Ranked - Scored capability for fallback ordering */
type RankedCapability = Readonly<{
  readonly capability: ProviderCapability
  readonly score: number
}>

const getScore = (
  scores: HashMap.HashMap<string, number>,
  key: string,
  fallback: number,
): number => Option.getOrElse(HashMap.get(scores, key), () => fallback)

const rankedOrder = Order.make<RankedCapability>((left, right) => {
  const scoreDelta = right.score - left.score
  if (scoreDelta < 0) return -1
  if (scoreDelta > 0) return 1

  const providerDelta = left.capability.providerId.localeCompare(
    right.capability.providerId,
  )
  if (providerDelta < 0) return -1
  if (providerDelta > 0) return 1

  const modelDelta = left.capability.modelId.localeCompare(
    right.capability.modelId,
  )
  if (modelDelta < 0) return -1
  if (modelDelta > 0) return 1
  return 0
})

/**
 * @Owl.Providers.Router.Scoring.Algorithm - Multi-dimensional selection logic
 */
export function scoreProvider(
  cap: ProviderCapability,
  ctx: RoutingContext,
  reliabilityScores: HashMap.HashMap<string, number> = HashMap.empty(),
): number {
  if (ctx.estimatedInputTokens > cap.contextWindow) return -Infinity

  const estimatedCost = estimateCapabilityCostUsd(
    cap,
    ctx.estimatedInputTokens,
    0,
  )

  if (ctx.costBudgetUsd !== undefined && estimatedCost > ctx.costBudgetUsd) {
    return -Infinity
  }

  const costScore = Math.max(
    ROUTING_SCORE_DEFAULTS.MIN_COST_SCORE,
    ROUTING_SCORE_DEFAULTS.MAX_COST_SCORE -
      estimatedCost / ROUTING_LIMITS.MAX_NORMALIZED_COST_USD,
  )

  const reasoningDepthScore = getScore(
    ROUTING_REASONING_SCORES,
    cap.reasoningDepth,
    ROUTING_SCORE_DEFAULTS.DEFAULT_REASONING_SCORE,
  )
  const modeReasoningDemand = getScore(
    ROUTING_MODE_REASONING_DEMAND,
    ctx.mode,
    ROUTING_SCORE_DEFAULTS.DEFAULT_MODE_DEMAND,
  )
  const reasoningScore =
    ROUTING_SCORE_DEFAULTS.MAX_COST_SCORE -
    Math.abs(reasoningDepthScore - modeReasoningDemand)

  const latencyScore =
    cap.maxOutputTokens <= ROUTING_LIMITS.FAST_MODEL_OUTPUT_TOKEN_LIMIT
      ? ROUTING_SCORE_DEFAULTS.FAST_LATENCY_SCORE
      : ROUTING_SCORE_DEFAULTS.STANDARD_LATENCY_SCORE

  const visionPenalty =
    ctx.requiresVision && !cap.supportsVision
      ? ROUTING_SCORE_DEFAULTS.UNSUPPORTED_VISION_PENALTY
      : ROUTING_SCORE_DEFAULTS.NO_VISION_PENALTY

  const reliabilityScore = getScore(
    reliabilityScores,
    cap.providerId,
    ROUTING_SCORE_DEFAULTS.BASE_RELIABILITY_SCORE,
  )

  return (
    ROUTING_WEIGHTS.COST * costScore +
    ROUTING_WEIGHTS.COMPLEXITY * reasoningScore +
    ROUTING_WEIGHTS.LATENCY * latencyScore +
    ROUTING_WEIGHTS.RELIABILITY * reliabilityScore +
    visionPenalty
  )
}

const rankCapabilities = (
  capabilities: readonly ProviderCapability[],
  ctx: RoutingContext,
  reliabilityScores: HashMap.HashMap<string, number>,
): Chunk.Chunk<RankedCapability> =>
  Chunk.sort(
    Chunk.filter(
      Chunk.map(
        Chunk.filter(
          Chunk.fromIterable(capabilities),
          (capability) =>
            ctx.localOnly !== true ||
            HashSet.has(LOCAL_PROVIDER_ID_SET, capability.providerId),
        ),
        (capability) =>
          Data.struct({
            capability,
            score: scoreProvider(capability, ctx, reliabilityScores),
          }),
      ),
      (entry) => Number.isFinite(entry.score),
    ),
    rankedOrder,
  )

const toCapabilities = (
  ranked: Chunk.Chunk<RankedCapability>,
): readonly ProviderCapability[] =>
  Chunk.toReadonlyArray(Chunk.map(ranked, (entry) => entry.capability))

/**
 * @Owl.Providers.Router.Scoring.Rank - Deterministic fallback order
 */
export function rankProviders(
  capabilities: readonly ProviderCapability[],
  ctx: RoutingContext,
  reliabilityScores: HashMap.HashMap<string, number> = HashMap.empty(),
): readonly ProviderCapability[] {
  const ranked = rankCapabilities(capabilities, ctx, reliabilityScores)

  if (ctx.preferredProvider === undefined) {
    return toCapabilities(ranked)
  }

  const preferred = Chunk.filter(
    ranked,
    (entry) => entry.capability.providerId === ctx.preferredProvider,
  )
  if (Chunk.isEmpty(preferred)) {
    return toCapabilities(ranked)
  }

  const nonPreferred = Chunk.filter(
    ranked,
    (entry) => entry.capability.providerId !== ctx.preferredProvider,
  )
  return toCapabilities(Chunk.appendAll(preferred, nonPreferred))
}

/**
 * @Owl.Providers.Router.Scoring.Selection - Entry point for provider resolution
 */
export function selectBestProvider(
  capabilities: readonly ProviderCapability[],
  ctx: RoutingContext,
  reliabilityScores: HashMap.HashMap<string, number> = HashMap.empty(),
): ProviderCapability | null {
  return rankProviders(capabilities, ctx, reliabilityScores)[0] ?? null
}

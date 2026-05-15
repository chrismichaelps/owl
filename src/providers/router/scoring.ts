/**
 * @Owl.Providers.Router.Scoring - Provider selection scoring algorithm
 *
 * Multi-dimensional scoring for provider/model selection:
 * - Cost: Cheaper providers score higher
 * - Reasoning: Match provider's reasoning depth to task mode
 * - Latency: Smaller models are faster
 * - Vision: Penalty if vision required but not supported
 *
 * Scoring weights (from ROUTING_WEIGHTS):
 * - COMPLEXITY: 0.35 (reasoning match)
 * - COST: 0.25
 * - LATENCY: 0.25
 * - RELIABILITY: 0.15
 *
 * Mode reasoning demands:
 * - god: 1.0 (high reasoning, full context)
 * - deep: 0.9
 * - standard: 0.5
 * - quick: 0.3
 * - economy: 0.1
 *
 * @example
 * const score = scoreProvider(capability, routingContext)
 * if (score > 0.7) { /* good match *\/ }
 */
import { ROUTING_LIMITS, ROUTING_WEIGHTS } from "../../core/constants/index.js"
import { estimateCapabilityCostUsd } from "../cost.js"
import type { ProviderCapability, RoutingContext } from "../types.js"

/** @Owl.Providers.Router.Scoring.Weights - Static demand and weight coefficients */
const REASONING_SCORES: Record<string, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
}

/** @Owl.Providers.Router.Scoring.Demand - Mode-based reasoning requirements */
const MODE_REASONING_DEMAND: Record<string, number> = {
  god: 1.0,
  deep: 0.9,
  standard: 0.5,
  quick: 0.3,
  economy: 0.1,
}

/**
 * @Owl.Providers.Router.Scoring.Algorithm - Multi-dimensional selection logic
 *
 * Score a provider capability against a routing context.
 * Returns -Infinity if hard constraints fail (e.g., context window too small).
 *
 * @param cap - Provider capability to score
 * @param ctx - Routing context with task requirements
 * @returns Score (higher = better match), or -Infinity if invalid
 */
export function scoreProvider(
  cap: ProviderCapability,
  ctx: RoutingContext,
): number {
  // Context window fit — hard gate
  if (ctx.estimatedInputTokens > cap.contextWindow) return -Infinity

  const estimatedCost = estimateCapabilityCostUsd(
    cap,
    ctx.estimatedInputTokens,
    0,
  )

  // Cost score: cheaper = higher score, normalized 0–1
  const costScore = Math.max(
    0,
    1 - estimatedCost / ROUTING_LIMITS.MAX_NORMALIZED_COST_USD,
  )

  // Reasoning score: matches mode demand
  const reasoningDepthScore = REASONING_SCORES[cap.reasoningDepth] ?? 0.5
  const modeReasoningDemand = MODE_REASONING_DEMAND[ctx.mode] ?? 0.5
  const reasoningScore = 1 - Math.abs(reasoningDepthScore - modeReasoningDemand)

  // Latency score: smaller models are faster
  const latencyScore =
    cap.maxOutputTokens <= ROUTING_LIMITS.FAST_MODEL_OUTPUT_TOKEN_LIMIT
      ? 0.8
      : 0.6

  // Vision requirement penalty
  const visionPenalty = ctx.requiresVision && !cap.supportsVision ? -1.0 : 0.0

  const score =
    ROUTING_WEIGHTS.COST * costScore +
    ROUTING_WEIGHTS.COMPLEXITY * reasoningScore +
    ROUTING_WEIGHTS.LATENCY * latencyScore +
    ROUTING_WEIGHTS.RELIABILITY * 0.8 + // base reliability
    visionPenalty

  return score
}

/** @Owl.Providers.Router.Scoring.Ranked - Scored capability for fallback ordering */
interface RankedCapability {
  readonly capability: ProviderCapability
  readonly score: number
}

const compareRankedCapabilities = (
  left: RankedCapability,
  right: RankedCapability,
): number => {
  const scoreDelta = right.score - left.score
  if (scoreDelta !== 0) return scoreDelta

  const providerDelta = left.capability.providerId.localeCompare(
    right.capability.providerId,
  )
  if (providerDelta !== 0) return providerDelta

  return left.capability.modelId.localeCompare(right.capability.modelId)
}

/**
 * @Owl.Providers.Router.Scoring.Rank - Deterministic fallback order
 *
 * Returns all valid capabilities in descending score order. If a preferred
 * Provider has valid capabilities, those capabilities are tried first while
 * preserving deterministic score order inside the preferred subset.
 */
export function rankProviders(
  capabilities: readonly ProviderCapability[],
  ctx: RoutingContext,
): readonly ProviderCapability[] {
  const ranked = capabilities
    .map((capability) => ({
      capability,
      score: scoreProvider(capability, ctx),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort(compareRankedCapabilities)

  if (ctx.preferredProvider === undefined) {
    return ranked.map((entry) => entry.capability)
  }

  const preferred = ranked.filter(
    (entry) => entry.capability.providerId === ctx.preferredProvider,
  )
  if (preferred.length === 0) {
    return ranked.map((entry) => entry.capability)
  }

  const nonPreferred = ranked.filter(
    (entry) => entry.capability.providerId !== ctx.preferredProvider,
  )
  return [...preferred, ...nonPreferred].map((entry) => entry.capability)
}

/**
 * @Owl.Providers.Router.Scoring.Selection - Entry point for provider resolution
 *
 * Select the best provider from a list of capabilities.
 * Honors preferredProvider if specified, otherwise picks highest scoring.
 *
 * @param capabilities - All available provider capabilities
 * @param ctx - Routing context
 * @returns Best matching capability, or null if none available
 */
export function selectBestProvider(
  capabilities: readonly ProviderCapability[],
  ctx: RoutingContext,
): ProviderCapability | null {
  return rankProviders(capabilities, ctx)[0] ?? null
}

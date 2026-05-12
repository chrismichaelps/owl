/** @Owl.Providers.Router.Scoring - Provider selection scoring algorithm */
import { ROUTING_WEIGHTS } from "../../core/constants/index.js"
import type { ProviderCapability, RoutingContext } from "../types.js"

/** @Owl.Providers.Router.Scoring.Weights - Static demand and weight coefficients */
const REASONING_SCORES: Record<string, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
}

const MODE_REASONING_DEMAND: Record<string, number> = {
  god: 1.0,
  deep: 0.9,
  standard: 0.5,
  quick: 0.3,
  economy: 0.1,
}

/** @Owl.Providers.Router.Scoring.Algorithm - Multi-dimensional selection logic */
export function scoreProvider(
  cap: ProviderCapability,
  ctx: RoutingContext,
): number {
  // Context window fit — hard gate
  if (ctx.estimatedInputTokens > cap.contextWindow) return -Infinity

  const estimatedCost = (ctx.estimatedInputTokens / 1000) * cap.inputCostPer1k

  // Cost score: cheaper = higher score, normalized 0–1
  const maxCost = 0.5
  const costScore = Math.max(0, 1 - estimatedCost / maxCost)

  // Reasoning score: matches mode demand
  const reasoningDepthScore = REASONING_SCORES[cap.reasoningDepth] ?? 0.5
  const modeReasoningDemand = MODE_REASONING_DEMAND[ctx.mode] ?? 0.5
  const reasoningScore = 1 - Math.abs(reasoningDepthScore - modeReasoningDemand)

  // Latency score: smaller models are faster
  const latencyScore = cap.maxOutputTokens <= 4096 ? 0.8 : 0.6

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

/** @Owl.Providers.Router.Scoring.Selection - Entry point for provider resolution */
export function selectBestProvider(
  capabilities: readonly ProviderCapability[],
  ctx: RoutingContext,
): ProviderCapability | null {
  if (capabilities.length === 0) return null

  let best: ProviderCapability | null = null
  let bestScore = -Infinity

  for (const cap of capabilities) {
    // Honor preferred provider if specified
    if (ctx.preferredProvider && cap.providerId !== ctx.preferredProvider) {
      continue
    }
    const score = scoreProvider(cap, ctx)
    if (score > bestScore) {
      bestScore = score
      best = cap
    }
  }

  // If preferred provider had no matches, fall back to all providers
  if (best === null && ctx.preferredProvider) {
    return selectBestProvider(capabilities, {
      ...ctx,
      preferredProvider: undefined,
    })
  }

  return best
}

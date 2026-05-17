import { HashMap } from "effect"

/** @Owl.Core.Constants.Routing - Weights for provider selection scoring */
export const ROUTING_WEIGHTS = {
  COMPLEXITY: 0.35,
  COST: 0.25,
  LATENCY: 0.25,
  RELIABILITY: 0.15,
} as const

/** @Owl.Core.Constants.RoutingLimits - Provider scoring and fallback limits */
export const ROUTING_LIMITS = {
  MAX_NORMALIZED_COST_USD: 0.5,
  FAST_MODEL_OUTPUT_TOKEN_LIMIT: 4_096,
  FALLBACK_PROVIDER_LIMIT: 2,
  MIN_PARALLEL_PROVIDER_LIMIT: 1,
  PARALLEL_PROVIDER_LIMIT: 2,
} as const

/** @Owl.Core.Constants.RoutingScores - Provider scoring lookup tables */
export const ROUTING_REASONING_SCORES: HashMap.HashMap<string, number> =
  HashMap.fromIterable([
    ["high", 1.0],
    ["medium", 0.6],
    ["low", 0.3],
  ])

/** @Owl.Core.Constants.RoutingDemand - Mode-based reasoning requirements */
export const ROUTING_MODE_REASONING_DEMAND: HashMap.HashMap<string, number> =
  HashMap.fromIterable([
    ["god", 1.0],
    ["deep", 0.9],
    ["standard", 0.5],
    ["quick", 0.3],
    ["economy", 0.1],
  ])

/** @Owl.Core.Constants.RoutingScoreDefaults - Provider score constants */
export const ROUTING_SCORE_DEFAULTS = {
  DEFAULT_REASONING_SCORE: 0.5,
  DEFAULT_MODE_DEMAND: 0.5,
  MIN_COST_SCORE: 0,
  MAX_COST_SCORE: 1,
  FAST_LATENCY_SCORE: 0.8,
  STANDARD_LATENCY_SCORE: 0.6,
  UNSUPPORTED_VISION_PENALTY: -1.0,
  NO_VISION_PENALTY: 0.0,
  BASE_RELIABILITY_SCORE: 0.8,
} as const

/** @Owl.Core.Constants.RoutingReliability - Adaptive provider health scoring */
export const ROUTING_RELIABILITY = {
  MIN_SCORE: 0.2,
  CONSECUTIVE_FAILURE_PENALTY: 0.2,
} as const

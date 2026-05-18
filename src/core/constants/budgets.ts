import { HashMap, Option } from "effect"

/** @Owl.Core.Constants.Budgets - Token and mode-specific constraints */
export const TOKEN_LIMITS = {
  CONTEXT_WINDOW_DEFAULT: 200_000,
  DEFAULT_SESSION_BUDGET: 32_000,
  MAX_OUTPUT_TOKENS: 8_192,
  MARKOV_WINDOW_SIZE: 2,
  CACHE_TRUST_SAMPLE_SIZE: 3,
  MIN_CONTEXT_RESERVE: 1_000,
  SUMMARY_TARGET_TOKENS: 500,
} as const

/** @Owl.Core.Constants.TokenPressure - Context pressure warning thresholds */
export const TOKEN_PRESSURE_THRESHOLDS = {
  WARNING_RATIO: 0.75,
  CRITICAL_RATIO: 0.9,
  PERCENT_SCALE: 100,
} as const

/** @Owl.Core.Constants.Modes - Mode-specific token budgets */
export const MODE_TOKEN_BUDGETS: HashMap.HashMap<string, number> =
  HashMap.fromIterable([
    ["economy", 2_000],
    ["quick", 8_000],
    ["standard", TOKEN_LIMITS.DEFAULT_SESSION_BUDGET],
    ["deep", 100_000],
    ["god", 200_000],
  ])

/** @Owl.Core.Constants.ModeBudget.Resolve - Stable token budget lookup */
export const resolveModeTokenBudget = (mode: string): number =>
  Option.getOrElse(
    HashMap.get(MODE_TOKEN_BUDGETS, mode),
    () => TOKEN_LIMITS.DEFAULT_SESSION_BUDGET,
  )

/** @Owl.Core.Constants.ModeCostBudget - Mode-specific estimated USD ceilings */
export const MODE_COST_BUDGETS: HashMap.HashMap<string, number> =
  HashMap.fromIterable([
    ["economy", 0.005],
    ["quick", 0.02],
    ["standard", 0.25],
  ])

/** @Owl.Core.Constants.CostBudget.Resolve - Optional estimated cost ceiling */
export const resolveModeCostBudget = (mode: string): number | undefined =>
  Option.getOrUndefined(HashMap.get(MODE_COST_BUDGETS, mode))

/** @Owl.Core.Constants.Thinking - Extended thinking token budgets per mode */
export const MODE_THINKING_BUDGETS: HashMap.HashMap<string, number> =
  HashMap.fromIterable([
    ["deep", 10_000],
    ["god", 20_000],
  ])

/** @Owl.Core.Constants.ThinkingBudget.Resolve - Optional extended thinking lookup */
export const resolveModeThinkingBudget = (mode: string): number | undefined =>
  Option.getOrUndefined(HashMap.get(MODE_THINKING_BUDGETS, mode))

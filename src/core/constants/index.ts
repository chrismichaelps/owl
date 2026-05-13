/** @Owl.Core.Constants - All system-wide constants. No magic values anywhere else. */

/** @Owl.Core.Constants.Budgets - Token and mode-specific constraints */
export const TOKEN_LIMITS = {
  CONTEXT_WINDOW_DEFAULT: 200_000,
  MAX_OUTPUT_TOKENS: 8_192,
  MARKOV_WINDOW_SIZE: 2,
  CACHE_TRUST_SAMPLE_SIZE: 3,
  MIN_CONTEXT_RESERVE: 1_000,
  SUMMARY_TARGET_TOKENS: 500,
} as const

export const MODE_TOKEN_BUDGETS: Record<string, number> = {
  economy: 2_000,
  quick: 8_000,
  standard: 32_000,
  deep: 100_000,
  god: 200_000,
} as const

/** @Owl.Core.Constants.Networking - Timeout and retry policies */
export const PROVIDER_TIMEOUTS = {
  DEFAULT_MS: 30_000,
  STREAM_CHUNK_TIMEOUT_MS: 5_000,
  CONNECT_TIMEOUT_MS: 10_000,
  OLLAMA_DEFAULT_MS: 60_000,
} as const

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1_000,
  MAX_DELAY_MS: 30_000,
  BACKOFF_FACTOR: 2,
  JITTER_FACTOR: 0.1,
} as const

/** @Owl.Core.Constants.FMCF - Governance and metric thresholds */
export const DEPTH_THRESHOLDS = {
  DEEP: 0.7,
  SHALLOW: 0.4,
} as const

export const SHARD_SPLIT_THRESHOLD = 0.15

export const SEAM_COLLAPSE_MONTHS = 6

export const SEAM_CAPACITY_SCORES = {
  BACKBONE: 9,
  CRITICAL: 6,
  EXPLORATORY: 3,
  INTERNAL: 0,
} as const

/** @Owl.Core.Constants.Routing - Weights for provider selection */
export const ROUTING_WEIGHTS = {
  COMPLEXITY: 0.35,
  COST: 0.25,
  LATENCY: 0.25,
  RELIABILITY: 0.15,
} as const

export const TUI_REFRESH_INTERVAL_MS = 100

export const TUI_MAX_LOG_LINES = 100

export const TUI_PANEL_WIDTHS = {
  LEFT: 0.3,
  CENTER: 0.45,
  RIGHT: 0.25,
} as const

/** @Owl.Core.Constants.Registry - Centralized HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  ANTHROPIC_OVERLOADED: 529,
} as const

/** @Owl.Core.Constants.Editor - Mutation pipeline and TLI constraints */
export const EDITOR_CONSTANTS = {
  DIFF_CONTEXT_LINES: 3,
  DIFF_TIMEOUT_MS: 5_000,
  MAX_FILE_SIZE_BYTES: 1_073_741_824,
  AMPERSAND_TOKEN: "<<:AMPERSAND_TOKEN:>>",
  DOLLAR_TOKEN: "<<:DOLLAR_TOKEN:>>",
} as const

export const PIPELINE_STAGES = [
  "analysis",
  "planning",
  "diff",
  "impact",
  "approval",
  "tli",
  "verification",
] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]

/** @Owl.Core.Constants.Commands - Command parsing and dispatch constraints */
export const COMMAND_CONSTANTS = {
  ID_PREFIX: "cmd",
  MIN_PROMPT_LENGTH: 1,
  MAX_PROMPT_LENGTH: 10_000,
} as const

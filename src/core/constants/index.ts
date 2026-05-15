/**
 * @Owl.Core.Constants - All system-wide constants. No magic values anywhere else.
 *
 * Centralizing constants enforces:
 * - Single source of truth for thresholds
 * - Type safety for literal types (PipelineStage, Mode, etc.)
 * - Discoverability: all config in one place
 *
 * Organized by domain:
 * - Budgets: Token and mode-specific constraints
 * - Networking: Timeouts and retry policies
 * - FMCF: Governance and metric thresholds
 * - Routing: Provider selection weights
 * - TUI: Display and refresh settings
 * - Registry: HTTP status codes
 * - Editor: Mutation pipeline constraints
 * - Commands: Parsing constraints
 * - CLI: Startup metadata and early-exit output
 */

/** @Owl.Core.Constants.Budgets - Token and mode-specific constraints */
export const TOKEN_LIMITS = {
  CONTEXT_WINDOW_DEFAULT: 200_000,
  MAX_OUTPUT_TOKENS: 8_192,
  MARKOV_WINDOW_SIZE: 2,
  CACHE_TRUST_SAMPLE_SIZE: 3,
  MIN_CONTEXT_RESERVE: 1_000,
  SUMMARY_TARGET_TOKENS: 500,
} as const

/**
 * @Owl.Core.Constants.Modes - Mode-specific token budgets
 *
 * Each mode has a token budget that controls context pruning:
 * - economy: 2,000 tokens (maximum cost control)
 * - quick: 8,000 tokens (fast responses)
 * - standard: 32,000 tokens (balanced)
 * - deep: 100,000 tokens (deep reasoning)
 * - god: 200,000 tokens (full context)
 */
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

/**
 * @Owl.Core.Constants.Retry - Exponential backoff retry configuration
 *
 * MAX_ATTEMPTS: Total retry attempts before giving up
 * BASE_DELAY_MS: Initial delay between retries
 * MAX_DELAY_MS: Maximum delay cap
 * BACKOFF_FACTOR: Multiplier for each subsequent retry
 * JITTER_FACTOR: Random factor to prevent thundering herd
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1_000,
  MAX_DELAY_MS: 30_000,
  BACKOFF_FACTOR: 2,
  JITTER_FACTOR: 0.1,
} as const

/** @Owl.Core.Constants.Providers - Supported Provider identifiers */
export const PROVIDER_IDS = [
  "anthropic",
  "openai",
  "google",
  "xai",
  "ollama",
] as const

/** @Owl.Core.Constants.ProviderRuntime - Provider adapter runtime limits */
export const PROVIDER_CONSTANTS = {
  TOKEN_ESTIMATION_CHARS_PER_TOKEN: 4,
  OLLAMA_STREAM_DELIMITER: "\n",
} as const

/** @Owl.Core.Constants.Cache - ContextCache retention and validation bounds */
export const CACHE_CONSTANTS = {
  MAX_ENTRIES: 100,
  MIN_TRUST_SCORE: 0,
  MAX_TRUST_SCORE: 1,
  PERSISTENCE_SCHEMA_VERSION: 1,
} as const

/** @Owl.Core.Constants.SessionMemory - Session persistence and retention bounds */
export const SESSION_MEMORY_CONSTANTS = {
  MAX_TURNS: 100,
  PERSISTENCE_SCHEMA_VERSION: 1,
  STORAGE_DIR: ".owl",
  STORAGE_FILE: "session-memory.json",
  SESSION_ID_PREFIX: "sess",
  SESSION_ID_COUNTER_PAD: 6,
} as const

/** @Owl.Core.Constants.Metrics - Runtime UsageMetrics constraints */
export const METRICS_CONSTANTS = {
  RECENT_INFERENCE_LIMIT: 10,
  CACHE_HIT_RATE_PERCENT_MULTIPLIER: 100,
  CACHE_HIT_RATE_DECIMAL_PLACES: 1,
} as const

/** @Owl.Core.Constants.Cost - Cost estimation and display constraints */
export const COST_CONSTANTS = {
  TOKEN_UNIT: 1_000,
  DECIMAL_BASE: 10,
  ESTIMATE_PRECISION_DECIMALS: 6,
  LOW_COST_THRESHOLD_USD: 0.5,
  LOW_COST_DECIMAL_PLACES: 4,
  STANDARD_COST_DECIMAL_PLACES: 2,
} as const

/**
 * @Owl.Core.Constants.FMCF - Governance and metric thresholds
 *
 * DEPTH_THRESHOLDS: DEPTH_SCORE classification boundaries
 * SHARD_SPLIT_THRESHOLD: % of file changed to trigger split protocol
 * SEAM_COLLAPSE_MONTHS: Age before EXPLORATORY seam is eligible for deletion
 * SEAM_CAPACITY_SCORES: Numeric scores for capacity levels
 */
export const DEPTH_THRESHOLDS = {
  DEEP: 0.7,
  SHALLOW: 0.4,
} as const

/** @Owl.Core.Constants.ShardSplit - Change threshold that triggers Shard Split Protocol */
export const SHARD_SPLIT_THRESHOLD = 0.15

/** @Owl.Core.Constants.Collapse - Months before EXPLORATORY seam can be collapsed */
export const SEAM_COLLAPSE_MONTHS = 6

/** @Owl.Core.Constants.Capacity - Numeric scores for seam capacity levels */
export const SEAM_CAPACITY_SCORES = {
  BACKBONE: 9,
  CRITICAL: 6,
  EXPLORATORY: 3,
  INTERNAL: 0,
} as const

/**
 * @Owl.Core.Constants.Routing - Weights for provider selection scoring
 *
 * COMPLEXITY: Match reasoning depth to mode demand
 * COST: Cheaper providers score higher
 * LATENCY: Smaller models are faster
 * RELIABILITY: Base reliability score
 */
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
} as const

/** @Owl.Core.Constants.TUI - Terminal UI refresh and layout */
export const TUI_REFRESH_INTERVAL_MS = 100

/** @Owl.Core.Constants.TUI - Maximum log entries to display */
export const TUI_MAX_LOG_LINES = 100

/** @Owl.Core.Constants.TUIRuntime - TUI IDs and preview limits */
export const TUI_CONSTANTS = {
  TASK_ID_PREFIX: "task",
  COMMAND_TURN_ID_PREFIX: "cmd",
  TASK_LOG_PREVIEW_CHARS: 40,
  LOG_PREVIEW_CHARS: 60,
  ERROR_LOG_PREVIEW_CHARS: 55,
} as const

/** @Owl.Core.Constants.TUI - Panel width ratios (left/center/right) */
export const TUI_PANEL_WIDTHS = {
  LEFT: 0.3,
  CENTER: 0.45,
  RIGHT: 0.25,
} as const

/**
 * @Owl.Core.Constants.Registry - HTTP status codes
 *
 * Standardized for use across all providers.
 * ANTHROPIC_OVERLOADED (529) is Anthropic-specific.
 */
export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  ANTHROPIC_OVERLOADED: 529,
} as const

/**
 * @Owl.Core.Constants.Editor - Mutation pipeline and TLI constraints
 *
 * DIFF_CONTEXT_LINES: Lines of context around each hunk
 * DIFF_TIMEOUT_MS: Max time for diff computation
 * MAX_FILE_SIZE_BYTES: 1GB limit for file operations
 * AMPERSAND_TOKEN/DOLLAR_TOKEN: Escape sequences for diff library
 */
export const EDITOR_CONSTANTS = {
  DIFF_CONTEXT_LINES: 3,
  DIFF_TIMEOUT_MS: 5_000,
  MAX_FILE_SIZE_BYTES: 1_073_741_824,
  AMPERSAND_TOKEN: "<<:AMPERSAND_TOKEN:>>",
  DOLLAR_TOKEN: "<<:DOLLAR_TOKEN:>>",
} as const

/**
 * @Owl.Core.Constants.Pipeline - 7-stage mutation pipeline stages
 *
 * Ordered array used to track pipeline progress:
 * 1. analysis → 2. planning → 3. diff → 4. impact → 5. approval → 6. tli → 7. verification
 */
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
  ID_HASH_LENGTH: 12,
  MIN_PROMPT_LENGTH: 1,
  MAX_PROMPT_LENGTH: 10_000,
} as const

/** @Owl.Core.Constants.CLI - Process entrypoint metadata */
export const CLI_CONSTANTS = {
  BINARY_NAME: "owl",
  VERSION: "0.1.0",
  DESCRIPTION: "AI coding agent CLI governed by FMCF",
  USAGE: 'owl [--mode=<mode>] [--quick|--deep|--economy] ["prompt"]',
  OPTIONS: [
    ["--help, -h", "Show this help text"],
    ["--version, -v", "Show the Owl CLI version"],
    ["--mode=<mode>", "Set mode: standard, quick, deep, economy, god"],
    ["--quick, -q", "Use quick mode"],
    ["--deep, -d", "Use deep mode"],
    ["--economy, -e", "Use economy mode"],
  ],
} as const

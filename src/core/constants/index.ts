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

import { HashMap, HashSet } from "effect"

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

/**
 * @Owl.Core.Constants.Thinking - Extended thinking token budgets per mode
 *
 * Extended thinking is enabled for deep/god modes on Anthropic models that support it.
 * Budget is the maximum tokens the model may use for internal reasoning before responding.
 * Must be less than max_tokens for the request.
 */
export const MODE_THINKING_BUDGETS: Record<string, number | undefined> = {
  economy: undefined,
  quick: undefined,
  standard: undefined,
  deep: 10_000,
  god: 20_000,
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

/** @Owl.Core.Constants.ProviderSet - Provider identifier membership lookup */
export const PROVIDER_ID_SET: HashSet.HashSet<string> =
  HashSet.fromIterable(PROVIDER_IDS)

/** @Owl.Core.Constants.Config - Environment configuration defaults */
export const CONFIG_CONSTANTS = {
  DEFAULT_OLLAMA_BASE_URL: "http://localhost:11434",
  DEFAULT_MODE: "standard",
  DEFAULT_LOG_LEVEL: "info",
  DEFAULT_MAX_CONCURRENT_PROVIDERS: 3,
  DEFAULT_TELEMETRY_ENABLED: false,
  MISSING_PROVIDER_API_KEY: "missing-provider-api-key",
} as const

/**
 * @Owl.Core.Constants.AnthropicModels - Canonical Anthropic model IDs
 *
 * Single source of truth for all model identifier strings.
 * Never compare against raw string literals — always reference these keys.
 */
export const ANTHROPIC_MODELS = {
  OPUS_4_7: "claude-opus-4-7",
  SONNET_4_6: "claude-sonnet-4-6",
  HAIKU_4_5: "claude-haiku-4-5-20251001",
} as const
export type AnthropicModelId =
  (typeof ANTHROPIC_MODELS)[keyof typeof ANTHROPIC_MODELS]

/** @Owl.Core.Constants.OpenAIModels - Canonical OpenAI model IDs */
export const OPENAI_MODELS = {
  GPT_4O: "gpt-4o",
  GPT_4_1: "gpt-4.1",
  O3: "o3",
  O4_MINI: "o4-mini",
  GPT_5: "gpt-5",
} as const

/** @Owl.Core.Constants.GoogleModels - Canonical Google model IDs */
export const GOOGLE_MODELS = {
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
  GEMINI_2_5_PRO: "gemini-2.5-pro",
} as const

/** @Owl.Core.Constants.XAIModels - Canonical xAI model IDs */
export const XAI_MODELS = {
  GROK_3: "grok-3",
} as const

/** @Owl.Core.Constants.OllamaModels - Canonical local model IDs */
export const OLLAMA_MODELS = {
  LLAMA_3_2: "llama3.2",
  CODE_LLAMA: "codellama",
} as const

/**
 * @Owl.Core.Constants.ThinkingModes - Modes that activate extended thinking
 *
 * Used for O(1) membership checks without scattered string comparisons.
 * Effect HashSet gives structural equality for future non-string keys.
 */
export const THINKING_MODES: HashSet.HashSet<string> = HashSet.fromIterable([
  "deep",
  "god",
])

/** @Owl.Core.Constants.ProviderRuntime - Provider adapter runtime limits */
export const PROVIDER_CONSTANTS = {
  TOKEN_ESTIMATION_CHARS_PER_TOKEN: 4,
  OLLAMA_STREAM_DELIMITER: "\n",
  XAI_BASE_URL: "https://api.x.ai/v1",
} as const

/** @Owl.Core.Constants.ProviderStreamLog - Stream event log formatting */
export const PROVIDER_STREAM_LOG = {
  PREVIEW_CHARS: 80,
  THINKING_PREFIX: "◌ Thinking",
  TOOL_PREFIX: "⚙ Tool",
} as const

/** @Owl.Core.Constants.StreamChunkTypes - Strict chunk type constants */
export const STREAM_CHUNK_TYPES = {
  TEXT: "text",
  THINKING: "thinking",
  TOOL_USE: "tool_use",
  STOP: "stop",
  USAGE: "usage",
} as const

/** @Owl.Core.Constants.ProviderAuto - Magic string replacement for auto routing */
export const PROVIDER_AUTO = "auto"

/** @Owl.Core.Constants.MCP - MCP configuration paths and naming */
export const MCP_CONSTANTS = {
  CONFIG_DIR: ".owl",
  CONFIG_FILE: "mcp_servers.json",
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

/** @Owl.Core.Constants.CapacityScores - Numeric scores for seam capacity levels */
export const SEAM_CAPACITY_SCORES = {
  BACKBONE: 9,
  CRITICAL: 6,
  EXPLORATORY: 3,
  INTERNAL: 0,
} as const

/** @Owl.Core.Constants.Capacity - Literal string capacities */
export const SEAM_CAPACITIES = {
  BACKBONE: "BACKBONE",
  CRITICAL: "CRITICAL",
  EXPLORATORY: "EXPLORATORY",
  INTERNAL: "INTERNAL",
} as const

/** @Owl.Core.Constants.Governance - Governance analysis outcomes */
export const SHARD_SPLIT_STATES = {
  OK: "OK",
  SHARD_SPLIT: "SHARD_SPLIT",
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

/** @Owl.Core.Constants.TUI - Terminal UI refresh and layout */
export const TUI_REFRESH_INTERVAL_MS = 100

/** @Owl.Core.Constants.TUI - Input special characters */
export const TUI_TRIGGERS = {
  HELP: "?",
  PALETTE: "/",
  MENTION: "@",
} as const

/** @Owl.Core.Constants.TUI - Maximum log entries to display */
export const TUI_MAX_LOG_LINES = 100

/** @Owl.Core.Constants.CLI - Command line flags */
export const CLI_FLAGS = {
  HELP: ["--help", "-h"],
  VERSION: ["--version", "-v"],
  QUICK: ["--quick", "-q"],
  DEEP: ["--deep", "-d"],
  ECONOMY: ["--economy", "-e"],
  MODE_PREFIX: "--mode=",
} as const

/** @Owl.Core.Constants.FileExtensions - Common file extensions */
export const FILE_EXTENSIONS = {
  MD: ".md",
  JSON: ".json",
} as const

/** @Owl.Core.Constants.Markdown - Parser block types */
export const MARKDOWN_BLOCK_TYPES = {
  TEXT: "text",
  CODE: "code",
  BULLET: "bullet",
  NUMBERED: "numbered",
  HEADER: "header",
  DIVIDER: "divider",
  IMAGE: "image",
  THINKING: "thinking",
} as const

/** @Owl.Core.Constants.Modes - Operational modes */
export const MODES = {
  STANDARD: "standard",
  QUICK: "quick",
  DEEP: "deep",
  ECONOMY: "economy",
  GOD: "god",
} as const

/** @Owl.Core.Constants.Roles - Deepening Flow role IDs */
export const ROLES = {
  ARCHITECT: "architect",
  DNA_ENGINEER: "dna-engineer",
  SHADOW: "shadow",
  GUARDIAN: "guardian",
} as const

/** @Owl.Core.Constants.Parser - Command line parsing characters */
export const PARSER_CHARS = {
  DOUBLE_QUOTE: '"',
  SINGLE_QUOTE: "'",
  SPACE: " ",
  TAB: "\t",
} as const

/** @Owl.Core.Constants.Effect - Internal Effect-TS tags */
export const EFFECT_TAGS = {
  SOME: "Some",
  NONE: "None",
  RIGHT: "Right",
  LEFT: "Left",
  INTERRUPTED: "Interrupted",
  FAILURE: "Failure",
  SUCCESS: "Success",
} as const

/** @Owl.Core.Constants.JS - Native JavaScript types */
export const JS_TYPES = {
  OBJECT: "object",
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  FUNCTION: "function",
  UNDEFINED: "undefined",
} as const

/** @Owl.Core.Constants.TUIRuntime - TUI IDs and preview limits */
export const TUI_CONSTANTS = {
  TASK_ID_PREFIX: "task",
  COMMAND_TURN_ID_PREFIX: "cmd",
  TASK_LOG_PREVIEW_CHARS: 40,
  LOG_PREVIEW_CHARS: 60,
  ERROR_LOG_PREVIEW_CHARS: 55,
} as const

/** @Owl.Core.Constants.TUIStatus - Strict TUI status literal constants */
export const AGENT_STATUS = {
  IDLE: "idle",
  ROUTING: "routing",
  INFERRING: "inferring",
  COMPLETE: "complete",
  ERROR: "error",
} as const

/** @Owl.Core.Constants.TUIAnimation - Terminal animation timing and frames */
export const TUI_ANIMATION = {
  FRAME_INTERVAL_MS: 80,
  REDUCED_MOTION_INTERVAL_MS: 1_000,
  SPINNER_FRAMES: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  PIPELINE_ACTIVE_FRAMES: ["◆", "◇", "◆", "◈"],
  PIPELINE_PENDING_GLYPH: "·",
  PIPELINE_COMPLETE_GLYPH: "✓",
  FMCF_ROLE_FLOW: ["Architect", "DNA Engineer", "Shadow", "Forensic Guardian"],
} as const

/** @Owl.Core.Constants.TUIPipeline - Pipeline visual states */
export const PIPELINE_STATE_CONSTANTS = {
  COMPLETE: "complete",
  ACTIVE: "active",
  PENDING: "pending",
} as const

/** @Owl.Core.Constants.TUITurn - Turn kind identifiers */
export const TURN_KIND_CONSTANTS = {
  COMMAND: "command",
  INFERENCE: "inference",
} as const

/** @Owl.Core.Constants.TUIWelcome - Welcome workbench layout text */
export const TUI_WELCOME = {
  MIN_WIDTH: 80,
  LEFT_COLUMN_WIDTH: 42,
  SEPARATOR_MIN_WIDTH: 40,
  BRAND_TITLE: "Owl",
  BRAND_SUBTITLE: "FMCF-governed AI coding agent",
  GETTING_STARTED_TITLE: "Tips for getting started",
  WHATS_NEW_TITLE: "Runtime status",
  PROMPT_HINT: "? for shortcuts · /help for commands",
  ROLE_HINT: "← / → for focus · /model for routing",
  OWL_MARK: ["   ◜◝   ◜◝   ", "  ◟  ◞ ◟  ◞  ", "    ◜▵▵◝    "],
} as const

/** @Owl.Core.Constants.TUIShortcuts - Discoverable terminal keybindings */
export const TUI_SHORTCUTS = [
  ["?", "Open or close shortcuts"],
  ["esc", "Cancel inference or close overlay"],
  ["ctrl+c", "Quit Owl"],
  ["↑ / ↓", "Navigate prompt history or palettes"],
  ["tab", "Accept selected slash command or file mention"],
  ["/", "Open slash command palette"],
  ["@file", "Attach project files to context"],
  ["/model", "Inspect or override provider routing"],
] as const

/** @Owl.Core.Constants.TUIShortcutsLayout - Shortcut panel dimensions */
export const TUI_SHORTCUTS_LAYOUT = {
  PANEL_WIDTH: 74,
  KEY_COLUMN_WIDTH: 11,
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
  MEMORY_PREVIEW_LENGTH: 80,
  PALETTE_VISIBLE_COUNT: 8,
  EDIT_PREVIEW_FLAG: "--preview",
  PENDING_MUTATION_LIMIT: 100,
} as const

/** @Owl.Core.Constants.Mentions - File mention expansion limits */
export const MENTION_CONSTANTS = {
  MAX_FILE_BYTES: 500_000,
  MAX_IMAGE_BYTES: 5_000_000,
  MAX_TOTAL_TEXT_BYTES: 2_000_000,
  DISPLAY_UNIT_BYTES: 1_024,
  MAX_FILE_LABEL: "500KB",
  MAX_IMAGE_LABEL: "5MB",
  MAX_TOTAL_TEXT_LABEL: "2MB",
} as const

/** @Owl.Core.Constants.ProjectContext - Startup context discovery bounds */
export const PROJECT_CONTEXT_CONSTANTS = {
  MAX_STATUS_CHARS: 2_000,
  MAX_INSTRUCTIONS_CHARS: 40_000,
  GIT_TIMEOUT_MS: 5_000,
  GIT_RECENT_COMMIT_LIMIT: "5",
  INSTRUCTIONS_FILE: "CLAUDE.md",
  OWL_CONFIG_DIR: ".owl",
  CLAUDE_CONFIG_DIR: ".claude",
  TRUNCATED_MARKER: "\n\n[...truncated]",
  STATUS_TRUNCATED_MARKER: "\n...(truncated)",
  SECTION_SEPARATOR: "\n\n---\n\n",
} as const

/** @Owl.Core.Constants.Compact - Conversation compaction command policy */
export const COMPACT_CONSTANTS = {
  COMMAND_NAME: "compact",
  MIN_MESSAGES: 4,
  MODE: "standard",
  SYSTEM_PROMPT: `You are a conversation summarizer. Your task is to produce a dense, structured summary of the conversation so far.

The summary must:
1. Preserve all key decisions, code changes, file paths, and architectural choices discussed
2. Note the current state of any work in progress
3. Capture any open questions or next steps
4. Be written as a self-contained context block the developer can resume from

Format: Start with "## Conversation Summary" then organize by topic. Be dense and precise.`,
  TASK_PROMPT:
    "Please summarize our conversation so far, preserving all important technical context.",
  CONTEXT_PREFIX:
    "## Compacted Context\n\nThe following is a summary of our conversation before compaction:\n\n",
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

/**
 * @Owl.Core.Constants.ToolNames - Canonical names for built-in agentic tools
 */
export const TOOL_NAMES = {
  BASH: "Bash",
  READ: "Read",
  WRITE: "Write",
  EDIT: "Edit",
  GLOB: "Glob",
  GREP: "Grep",
} as const
export type BuiltInToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES]

/**
 * @Owl.Core.Constants.ToolLimits - Safety and resource limits for built-in tools
 */
export const TOOL_CONSTANTS = {
  BASH_DEFAULT_TIMEOUT_MS: 120_000,
  BASH_MAX_TIMEOUT_MS: 600_000,
  BASH_MAX_OUTPUT_CHARS: 200_000,
  READ_MAX_LINES: 2_000,
  READ_MAX_BYTES: 1_048_576,
  WRITE_MAX_BYTES: 10_485_760,
  GLOB_MAX_RESULTS: 1_000,
  GREP_MAX_OUTPUT_CHARS: 100_000,
  GREP_CONTEXT_LINES: 2,
  GREP_TIMEOUT_MS: 30_000,
} as const

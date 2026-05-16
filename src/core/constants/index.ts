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

import { Chunk, HashMap, HashSet, Option } from "effect"

export * from "./providers.js"

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

/**
 * @Owl.Core.Constants.Thinking - Extended thinking token budgets per mode
 *
 * Extended thinking is enabled for deep/god modes on Anthropic models that support it.
 * Budget is the maximum tokens the model may use for internal reasoning before responding.
 * Must be less than max_tokens for the request.
 */
export const MODE_THINKING_BUDGETS: HashMap.HashMap<string, number> =
  HashMap.fromIterable([
    ["deep", 10_000],
    ["god", 20_000],
  ])

/** @Owl.Core.Constants.ThinkingBudget.Resolve - Optional extended thinking lookup */
export const resolveModeThinkingBudget = (mode: string): number | undefined =>
  Option.getOrUndefined(HashMap.get(MODE_THINKING_BUDGETS, mode))

/** @Owl.Core.Constants.MCP - MCP configuration paths and naming */
export const MCP_CONSTANTS = {
  CONFIG_DIR: ".owl",
  CONFIG_FILE: "mcp_servers.json",
  TOOL_SEPARATOR: "__",
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
  STATUS_MODEL_LIMIT: 5,
  STATUS_RECENT_LIMIT: 3,
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

/** @Owl.Core.Constants.Format - Shared display formatting units */
export const FORMAT_CONSTANTS = {
  BYTE_UNIT: 1_024,
  BYTE_DECIMAL_PLACES: 1,
  BYTE_SUFFIX: "b",
  KILOBYTE_SUFFIX: "kb",
  MEGABYTE_SUFFIX: "mb",
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

/** @Owl.Core.Constants.TUIModeCommands - Slash commands that submit mode-scoped prompts */
export const TUI_SLASH_MODE_COMMANDS: HashMap.HashMap<string, string> =
  HashMap.fromIterable([
    ["/task", "standard"],
    ["/quick", "quick"],
    ["/deep", "deep"],
    ["/economy", "economy"],
    ["/god", "god"],
  ])

/** @Owl.Core.Constants.TUIModeColors - Prompt glyph color lookup by mode */
export const TUI_MODE_COLORS: HashMap.HashMap<string, string> =
  HashMap.fromIterable([
    ["standard", "green"],
    ["quick", "yellow"],
    ["deep", "blue"],
    ["economy", "gray"],
    ["god", "red"],
  ])

/** @Owl.Core.Constants.TUI - Maximum log entries to display */
export const TUI_MAX_LOG_LINES = 100

/** @Owl.Core.Constants.TUILogPanel - Engine log panel layout limits */
export const TUI_LOG_PANEL = {
  PANEL_WIDTH: 32,
  DIVIDER_WIDTH: 26,
  VISIBLE_LINES: 18,
} as const

/** @Owl.Core.Constants.TUIOutputPanel - Conversation viewport layout estimates */
export const TUI_OUTPUT_PANEL = {
  RESERVED_ROWS: 11,
  ROWS_PER_TURN: 6,
} as const

/** @Owl.Core.Constants.TUIVisualFallbacks - Safe terminal visual defaults */
export const TUI_VISUAL_FALLBACKS = {
  COLOR: "gray",
  STATUS_ICON: "●",
} as const

/** @Owl.Core.Constants.TUIStatusIcons - Agent status glyph lookup */
export const TUI_STATUS_ICONS: HashMap.HashMap<string, string> =
  HashMap.fromIterable([
    ["idle", "●"],
    ["routing", "◆"],
    ["inferring", "◈"],
    ["complete", "✓"],
    ["error", "✗"],
  ])

/** @Owl.Core.Constants.TUIStatusColors - Agent status color lookup */
export const TUI_STATUS_COLORS: HashMap.HashMap<string, string> =
  HashMap.fromIterable([
    ["idle", "gray"],
    ["routing", "yellow"],
    ["inferring", "cyan"],
    ["complete", "green"],
    ["error", "red"],
  ])

/** @Owl.Core.Constants.TUIRoleColors - FMCF role color lookup */
export const TUI_ROLE_COLORS: HashMap.HashMap<string, string> =
  HashMap.fromIterable([
    ["Architect", "blue"],
    ["DNA Engineer", "yellow"],
    ["Shadow", "magenta"],
    ["Forensic Guardian", "green"],
  ])

/** @Owl.Core.Constants.CLI - Command line flags */
export const CLI_FLAGS = {
  HELP: ["--help", "-h"],
  VERSION: ["--version", "-v"],
  QUICK: ["--quick", "-q"],
  DEEP: ["--deep", "-d"],
  ECONOMY: ["--economy", "-e"],
  MODE_PREFIX: "--mode=",
} as const

/** @Owl.Core.Constants.CLIFlagSets - Command line flag membership lookups */
export const CLI_FLAG_SETS = {
  HELP: HashSet.fromIterable(CLI_FLAGS.HELP),
  VERSION: HashSet.fromIterable(CLI_FLAGS.VERSION),
  QUICK: HashSet.fromIterable(CLI_FLAGS.QUICK),
  DEEP: HashSet.fromIterable(CLI_FLAGS.DEEP),
  ECONOMY: HashSet.fromIterable(CLI_FLAGS.ECONOMY),
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

/** @Owl.Core.Constants.MarkdownParsing - Markdown parser structural constants */
export const MARKDOWN_CONSTANTS = {
  CODE_FENCE_LENGTH: 3,
} as const

/** @Owl.Core.Constants.Modes - Operational modes */
export const MODES = {
  STANDARD: "standard",
  QUICK: "quick",
  DEEP: "deep",
  ECONOMY: "economy",
  GOD: "god",
} as const

/** @Owl.Core.Constants.ModeIds - Ordered operational mode identifiers */
export const MODE_IDS: Chunk.Chunk<string> = Chunk.make(
  MODES.STANDARD,
  MODES.QUICK,
  MODES.DEEP,
  MODES.ECONOMY,
  MODES.GOD,
)

/** @Owl.Core.Constants.ModeIdSet - Operational mode membership lookup */
export const MODE_ID_SET: HashSet.HashSet<string> =
  HashSet.fromIterable(MODE_IDS)

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

/** @Owl.Core.Constants.TUIHistory - Prompt history storage and retention */
export const TUI_HISTORY_CONSTANTS = {
  STORAGE_DIR: ".owl",
  STORAGE_FILE: "history.jsonl",
  MAX_ENTRIES: 200,
  FILE_MODE: 0o600,
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
  DIFF_SIDE_BY_SIDE_WIDTH: 44,
  DIFF_SIDE_BY_SIDE_SEPARATOR: " │ ",
  IMPACT_LOW_THRESHOLD: 0.05,
  IMPACT_PERCENT_MULTIPLIER: 100,
  IMPACT_PERCENT_DECIMALS: 1,
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
  APPLY_ALL_FLAG: "--all",
  REJECT_ALL_FLAG: "--all",
  DIFF_SIDE_BY_SIDE_FLAG: "--side-by-side",
  EXPORT_DEFAULT_PREFIX: "owl-export",
  EXPORT_MARKDOWN_EXTENSION: ".md",
  ADD_MAX_FILE_BYTES: 500_000,
  ADD_MAX_TOTAL_BYTES: 1_000_000,
  HISTORY_PROMPTS_SUBCOMMAND: "prompts",
  PENDING_MUTATION_LIMIT: 100,
} as const

/** @Owl.Core.Constants.Mentions - File mention expansion limits */
export const MENTION_CONSTANTS = {
  MAX_FILE_BYTES: 500_000,
  MAX_IMAGE_BYTES: 5_000_000,
  MAX_TOTAL_TEXT_BYTES: 2_000_000,
  PROJECT_FILE_LIMIT: 200,
  VISIBLE_SUGGESTION_COUNT: 8,
  DISPLAY_UNIT_BYTES: 1_024,
  MAX_FILE_LABEL: "500KB",
  MAX_IMAGE_LABEL: "5MB",
  MAX_TOTAL_TEXT_LABEL: "2MB",
} as const

/** @Owl.Core.Constants.MentionIgnores - Project file mention ignore globs */
export const MENTION_FILE_IGNORE_PATTERNS = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "*.lock",
  "*.log",
] as const

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
  BASH_SHELL: "/bin/sh",
  BASH_COMMAND_FLAG: "-c",
  BASH_MIN_TIMEOUT_MS: 1_000,
  BASH_DEFAULT_TIMEOUT_MS: 120_000,
  BASH_MAX_TIMEOUT_MS: 600_000,
  BASH_MAX_OUTPUT_CHARS: 200_000,
  BASH_MAX_BUFFER_MULTIPLIER: 4,
  READ_MAX_LINES: 2_000,
  READ_MAX_BYTES: 1_048_576,
  WRITE_MAX_BYTES: 10_485_760,
  GLOB_MAX_RESULTS: 1_000,
  GREP_MAX_OUTPUT_CHARS: 100_000,
  GREP_MAX_BUFFER_MULTIPLIER: 4,
  GREP_CONTEXT_LINES: 2,
  GREP_TIMEOUT_MS: 30_000,
} as const

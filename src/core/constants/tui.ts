import { HashMap } from "effect"

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

/** @Owl.Core.Constants.TUIRuntime - TUI IDs and preview limits */
export const TUI_CONSTANTS = {
  TASK_ID_PREFIX: "task",
  COMMAND_TURN_ID_PREFIX: "cmd",
  TASK_LOG_PREVIEW_CHARS: 40,
  LOG_PREVIEW_CHARS: 60,
  ERROR_LOG_PREVIEW_CHARS: 55,
} as const

/** @Owl.Core.Constants.TUIRuntimeCopy - Runtime log messages */
export const TUI_RUNTIME_COPY = {
  RESPONSE_RECORDED: "✓ Response recorded",
  ADAPTIVE_ROUTE_PREFIX: "↗ Route escalated",
} as const

/** @Owl.Core.Constants.TUIRoutingCopy - Routing mode display labels */
export const TUI_ROUTING_COPY = {
  LABEL: "Route",
  AUTO_SUFFIX: "adaptive",
  MODE_SEPARATOR: " → ",
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

/** @Owl.Core.Constants.TUIPendingApprovals - Pending edit approval rail */
export const TUI_PENDING_APPROVALS = {
  VISIBLE_ITEMS: 4,
  FILE_PREVIEW_LIMIT: 2,
  EMPTY_LABEL: "No pending edits",
  TITLE: "Pending edits",
} as const

/** @Owl.Core.Constants.TUI - Panel width ratios (left/center/right) */
export const TUI_PANEL_WIDTHS = {
  LEFT: 0.3,
  CENTER: 0.45,
  RIGHT: 0.25,
} as const

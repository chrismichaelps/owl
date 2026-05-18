import { HashSet } from "effect"

/** @Owl.Core.Constants.CLI - Command line flags */
export const CLI_FLAGS = {
  HELP: ["--help", "-h"],
  VERSION: ["--version", "-v"],
  QUICK: ["--quick", "-q"],
  DEEP: ["--deep", "-d"],
  ECONOMY: ["--economy", "-e"],
  MODE: "--mode",
  MODE_PREFIX: "--mode=",
  PERMISSION_MODE: "--permission-mode",
  PERMISSION_MODE_PREFIX: "--permission-mode=",
  DANGEROUSLY_SKIP_PERMISSIONS: "--dangerously-skip-permissions",
} as const

/** @Owl.Core.Constants.CLIFlagSets - Command line flag membership lookups */
export const CLI_FLAG_SETS = {
  HELP: HashSet.fromIterable(CLI_FLAGS.HELP),
  VERSION: HashSet.fromIterable(CLI_FLAGS.VERSION),
  QUICK: HashSet.fromIterable(CLI_FLAGS.QUICK),
  DEEP: HashSet.fromIterable(CLI_FLAGS.DEEP),
  ECONOMY: HashSet.fromIterable(CLI_FLAGS.ECONOMY),
} as const

/** @Owl.Core.Constants.Parser - Command line parsing characters */
export const PARSER_CHARS = {
  DOUBLE_QUOTE: '"',
  SINGLE_QUOTE: "'",
  SPACE: " ",
  TAB: "\t",
} as const

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
  CACHE_CLEAR_SUBCOMMAND: "clear",
  PENDING_MUTATION_LIMIT: 100,
  COMPARE_RESPONSE_SEPARATOR: "\n\n---\n\n",
  DOCTOR_SCORE_DECIMALS: 2,
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
  USAGE:
    'owl [--mode=<mode>] [--permission-mode=<mode>] [--quick|--deep|--economy] ["prompt"]',
  OPTIONS: [
    ["--help, -h", "Show this help text"],
    ["--version, -v", "Show the Owl CLI version"],
    ["--mode=<mode>", "Set mode: standard, quick, deep, economy, god"],
    [
      "--permission-mode=<mode>",
      "Set tool permissions: default, acceptEdits, bypassPermissions, plan, dontAsk",
    ],
    [
      "--dangerously-skip-permissions",
      "Start with bypassPermissions for non-blocked tools",
    ],
    ["--quick, -q", "Use quick mode"],
    ["--deep, -d", "Use deep mode"],
    ["--economy, -e", "Use economy mode"],
  ],
} as const

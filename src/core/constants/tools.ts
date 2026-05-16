/** @Owl.Core.Constants.ToolNames - Canonical names for built-in agentic tools */
export const TOOL_NAMES = {
  BASH: "Bash",
  READ: "Read",
  WRITE: "Write",
  EDIT: "Edit",
  GLOB: "Glob",
  GREP: "Grep",
} as const
export type BuiltInToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES]

/** @Owl.Core.Constants.ToolLimits - Safety and resource limits for built-in tools */
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

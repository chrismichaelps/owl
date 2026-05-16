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

/** @Owl.Core.Constants.Editor - Mutation pipeline and TLI constraints */
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

/** @Owl.Core.Constants.Pipeline - 7-stage mutation pipeline stages */
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
  FILE_CLOSE_TAG: "</file>",
  ESCAPED_FILE_CLOSE_TAG: "<\\/file>",
  XML_AMPERSAND: "&",
  XML_AMPERSAND_ENTITY: "&amp;",
  XML_QUOTE: '"',
  XML_QUOTE_ENTITY: "&quot;",
  XML_LT: "<",
  XML_LT_ENTITY: "&lt;",
  XML_GT: ">",
  XML_GT_ENTITY: "&gt;",
} as const

/** @Owl.Core.Constants.MentionIgnores - Project file mention ignore globs */
export const MENTION_FILE_IGNORE_PATTERNS = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "*.lock",
  "*.log",
] as const

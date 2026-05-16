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

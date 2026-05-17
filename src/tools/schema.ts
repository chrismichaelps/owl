/** @Owl.Tools.Schema - Schema-first built-in tool inputs */
import { Either, Schema } from "effect"
import { ToolExecutionError } from "../core/errors/index.js"
import { TOOL_NAMES } from "../core/constants/index.js"

/** @Owl.Tools.Schema.Bash - Shell command input contract */
export const BashToolInputSchema = Schema.Struct({
  command: Schema.String,
  description: Schema.optional(Schema.String),
  timeout_ms: Schema.optional(Schema.Number),
})
export type BashToolInput = Schema.Schema.Type<typeof BashToolInputSchema>

/** @Owl.Tools.Schema.Read - File read input contract */
export const ReadToolInputSchema = Schema.Struct({
  file_path: Schema.String,
  offset: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
})
export type ReadToolInput = Schema.Schema.Type<typeof ReadToolInputSchema>

/** @Owl.Tools.Schema.Write - File write input contract */
export const WriteToolInputSchema = Schema.Struct({
  file_path: Schema.String,
  content: Schema.String,
})
export type WriteToolInput = Schema.Schema.Type<typeof WriteToolInputSchema>

/** @Owl.Tools.Schema.Edit - Exact replacement input contract */
export const EditToolInputSchema = Schema.Struct({
  file_path: Schema.String,
  old_string: Schema.String,
  new_string: Schema.String,
  replace_all: Schema.optional(Schema.Boolean),
})
export type EditToolInput = Schema.Schema.Type<typeof EditToolInputSchema>

/** @Owl.Tools.Schema.Glob - Glob search input contract */
export const GlobToolInputSchema = Schema.Struct({
  pattern: Schema.String,
  path: Schema.optional(Schema.String),
})
export type GlobToolInput = Schema.Schema.Type<typeof GlobToolInputSchema>

/** @Owl.Tools.Schema.Grep - Text search input contract */
export const GrepToolInputSchema = Schema.Struct({
  pattern: Schema.String,
  path: Schema.optional(Schema.String),
  include: Schema.optional(Schema.String),
})
export type GrepToolInput = Schema.Schema.Type<typeof GrepToolInputSchema>

type KnownToolName =
  | typeof TOOL_NAMES.BASH
  | typeof TOOL_NAMES.READ
  | typeof TOOL_NAMES.WRITE
  | typeof TOOL_NAMES.EDIT
  | typeof TOOL_NAMES.GLOB
  | typeof TOOL_NAMES.GREP

function decodeWithSchema<A, I>(
  tool: KnownToolName,
  schema: Schema.Schema<A, I>,
  input: unknown,
): A | ToolExecutionError {
  const decoded = Schema.decodeUnknownEither(schema)(input)
  if (Either.isRight(decoded)) {
    return decoded.right
  }
  return new ToolExecutionError({
    tool,
    reason: `Invalid tool input: ${String(decoded.left)}`,
  })
}

export function decodeToolInput(
  tool: typeof TOOL_NAMES.BASH,
  input: unknown,
): BashToolInput | ToolExecutionError
export function decodeToolInput(
  tool: typeof TOOL_NAMES.READ,
  input: unknown,
): ReadToolInput | ToolExecutionError
export function decodeToolInput(
  tool: typeof TOOL_NAMES.WRITE,
  input: unknown,
): WriteToolInput | ToolExecutionError
export function decodeToolInput(
  tool: typeof TOOL_NAMES.EDIT,
  input: unknown,
): EditToolInput | ToolExecutionError
export function decodeToolInput(
  tool: typeof TOOL_NAMES.GLOB,
  input: unknown,
): GlobToolInput | ToolExecutionError
export function decodeToolInput(
  tool: typeof TOOL_NAMES.GREP,
  input: unknown,
): GrepToolInput | ToolExecutionError
export function decodeToolInput(
  tool: KnownToolName,
  input: unknown,
):
  | BashToolInput
  | ReadToolInput
  | WriteToolInput
  | EditToolInput
  | GlobToolInput
  | GrepToolInput
  | ToolExecutionError {
  switch (tool) {
    case TOOL_NAMES.BASH:
      return decodeWithSchema(tool, BashToolInputSchema, input)
    case TOOL_NAMES.READ:
      return decodeWithSchema(tool, ReadToolInputSchema, input)
    case TOOL_NAMES.WRITE:
      return decodeWithSchema(tool, WriteToolInputSchema, input)
    case TOOL_NAMES.EDIT:
      return decodeWithSchema(tool, EditToolInputSchema, input)
    case TOOL_NAMES.GLOB:
      return decodeWithSchema(tool, GlobToolInputSchema, input)
    case TOOL_NAMES.GREP:
      return decodeWithSchema(tool, GrepToolInputSchema, input)
  }
}

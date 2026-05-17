/**
 * @Owl.Tools.Edit - Surgical exact-string replacement in files
 *
 * Finds the first (or all) occurrence(s) of old_string in a file and
 * replaces with new_string. Fails loudly when old_string is ambiguous
 * (multiple matches and replace_all is false) or absent.
 */
import { readFile, writeFile } from "node:fs/promises"
import { Chunk, Effect } from "effect"
import { TOOL_NAMES } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import { resolveToolPath } from "./path.js"
import { decodeToolInput } from "./schema.js"
import type { BuiltInTool } from "./types.js"

const DESCRIPTION = `Perform an exact string replacement in an existing file.

Usage:
- old_string must exactly match the text in the file (including whitespace and indentation)
- The edit fails if old_string is not found or appears more than once (use replace_all: true to replace all occurrences)
- Always read the file with the Read tool before editing so you can supply the exact text
- Prefer small, targeted old_strings (2-4 lines) over large context blocks`

export const EditTool: BuiltInTool = {
  name: TOOL_NAMES.EDIT,
  description: DESCRIPTION,
  modelVisible: false,
  input_schema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Absolute or project-relative path to the file to edit",
      },
      old_string: {
        type: "string",
        description: "The exact text to find and replace",
      },
      new_string: {
        type: "string",
        description: "The text to replace old_string with",
      },
      replace_all: {
        type: "boolean",
        description:
          "Replace all occurrences of old_string instead of just the first (default: false)",
      },
    },
    required: ["file_path", "old_string", "new_string"],
  },

  execute: (input, cwd) =>
    Effect.gen(function* () {
      const decoded = decodeToolInput(TOOL_NAMES.EDIT, input)
      if (decoded instanceof ToolExecutionError) {
        return yield* Effect.fail(decoded)
      }

      if (decoded.file_path.trim().length === 0) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.EDIT,
            reason: "file_path must be a non-empty string",
          }),
        )
      }

      const replaceAll = decoded.replace_all === true
      const absPath = yield* resolveToolPath(
        cwd,
        decoded.file_path,
        TOOL_NAMES.EDIT,
      )

      const original = yield* Effect.tryPromise({
        try: () => readFile(absPath, "utf-8"),
        catch: (e) =>
          new ToolExecutionError({
            tool: TOOL_NAMES.EDIT,
            reason: `Cannot read file: ${absPath}`,
            cause: e,
          }),
      })

      const occurrences =
        Chunk.size(Chunk.fromIterable(original.split(decoded.old_string))) - 1

      if (occurrences === 0) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.EDIT,
            reason: `old_string not found in ${absPath}. Re-read the file to get the exact current content.`,
          }),
        )
      }

      if (occurrences > 1 && !replaceAll) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.EDIT,
            reason: `old_string appears ${String(occurrences)} times in ${absPath}. Add more surrounding context to make it unique, or set replace_all: true.`,
          }),
        )
      }

      const updated = replaceAll
        ? original.split(decoded.old_string).join(decoded.new_string)
        : original.replace(decoded.old_string, decoded.new_string)

      yield* Effect.tryPromise({
        try: () => writeFile(absPath, updated, "utf-8"),
        catch: (e) =>
          new ToolExecutionError({
            tool: TOOL_NAMES.EDIT,
            reason: `Cannot write file: ${absPath}`,
            cause: e,
          }),
      })

      const replaced = replaceAll ? occurrences : 1
      return `Replaced ${String(replaced)} occurrence(s) in ${absPath}`
    }),
}

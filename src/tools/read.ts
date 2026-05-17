/**
 * @Owl.Tools.Read - File reading tool
 *
 * Returns file contents in cat-n format (line numbers) with optional
 * offset/limit for targeted reads on large files.
 * Output is bounded by READ_MAX_LINES and READ_MAX_BYTES.
 */
import { readFile } from "node:fs/promises"
import { Chunk, Effect } from "effect"
import { TOOL_NAMES, TOOL_CONSTANTS } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import { formatBytes } from "../core/utils/format.js"
import { resolveToolPath } from "./path.js"
import { decodeToolInput } from "./schema.js"
import type { BuiltInTool } from "./types.js"

const DESCRIPTION = `Read a file from the filesystem and return its contents with line numbers.

Usage:
- file_path must be an absolute path or a path relative to the project root
- Returns content in cat -n format: "   1\\t<line>"
- By default reads up to ${String(TOOL_CONSTANTS.READ_MAX_LINES)} lines from the start
- Use offset (1-based line number) and limit to read specific sections of large files
- Files larger than ${formatBytes(TOOL_CONSTANTS.READ_MAX_BYTES)} are truncated`

function formatLines(lines: Chunk.Chunk<string>, startLine: number): string {
  return Chunk.toReadonlyArray(
    Chunk.map(lines, (line, index) => {
      const lineNum = startLine + index
      const padded = String(lineNum).padStart(4, " ")
      return `${padded}\t${line}`
    }),
  ).join("\n")
}

export const ReadTool: BuiltInTool = {
  name: TOOL_NAMES.READ,
  description: DESCRIPTION,
  modelVisible: true,
  input_schema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Absolute or project-relative path to the file to read",
      },
      offset: {
        type: "number",
        description: "1-based line number to start reading from (default: 1)",
      },
      limit: {
        type: "number",
        description: `Maximum number of lines to return (default: ${String(TOOL_CONSTANTS.READ_MAX_LINES)})`,
      },
    },
    required: ["file_path"],
  },

  execute: (input, cwd) =>
    Effect.gen(function* () {
      const decoded = decodeToolInput(TOOL_NAMES.READ, input)
      if (decoded instanceof ToolExecutionError) {
        return yield* Effect.fail(decoded)
      }

      if (decoded.file_path.trim().length === 0) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.READ,
            reason: "file_path must be a non-empty string",
          }),
        )
      }

      const absPath = yield* resolveToolPath(
        cwd,
        decoded.file_path,
        TOOL_NAMES.READ,
      )

      const content = yield* Effect.tryPromise({
        try: () => readFile(absPath, "utf-8"),
        catch: (e) =>
          new ToolExecutionError({
            tool: TOOL_NAMES.READ,
            reason: `Cannot read file: ${absPath}`,
            cause: e,
          }),
      })

      if (content.length > TOOL_CONSTANTS.READ_MAX_BYTES) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.READ,
            reason: `File too large (${formatBytes(content.length)}, max ${formatBytes(TOOL_CONSTANTS.READ_MAX_BYTES)})`,
          }),
        )
      }

      const allLines = Chunk.fromIterable(content.split("\n"))

      const offset =
        decoded.offset !== undefined
          ? Math.max(1, Math.floor(decoded.offset))
          : 1
      const limit =
        decoded.limit !== undefined
          ? Math.min(
              Math.max(1, Math.floor(decoded.limit)),
              TOOL_CONSTANTS.READ_MAX_LINES,
            )
          : TOOL_CONSTANTS.READ_MAX_LINES

      const startIdx = offset - 1
      const slice = Chunk.take(Chunk.drop(allLines, startIdx), limit)

      if (Chunk.isEmpty(slice)) {
        return `(empty file or offset beyond end of file)`
      }

      const totalLines = Chunk.size(allLines)
      const endLine = Math.min(offset + limit - 1, totalLines)
      const header =
        totalLines > limit || offset > 1
          ? `[Lines ${String(offset)}–${String(endLine)} of ${String(totalLines)}]\n`
          : ""

      return header + formatLines(slice, offset)
    }),
}

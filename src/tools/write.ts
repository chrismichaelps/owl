/**
 * @Owl.Tools.Write - File creation and overwrite tool
 *
 * Writes content to a file, creating parent directories as needed.
 * Bounded by WRITE_MAX_BYTES to prevent runaway generation.
 */
import { writeFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { Chunk, Effect } from "effect"
import { TOOL_NAMES, TOOL_CONSTANTS } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import { formatBytes } from "../core/utils/format.js"
import { resolveToolPath } from "./path.js"
import type { BuiltInTool } from "./types.js"

const DESCRIPTION = `Write content to a file, creating parent directories if needed.

Usage:
- file_path must be an absolute path or a path relative to the project root
- Overwrites the file if it already exists
- Parent directories are created automatically
- Content size is limited to ${formatBytes(TOOL_CONSTANTS.WRITE_MAX_BYTES)}`

export const WriteTool: BuiltInTool = {
  name: TOOL_NAMES.WRITE,
  description: DESCRIPTION,
  modelVisible: false,
  input_schema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Absolute or project-relative path to the file to write",
      },
      content: {
        type: "string",
        description: "The content to write to the file",
      },
    },
    required: ["file_path", "content"],
  },

  execute: (input, cwd) =>
    Effect.gen(function* () {
      const rawPath = input.file_path
      const content = input.content

      if (typeof rawPath !== "string" || rawPath.trim().length === 0) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.WRITE,
            reason: "file_path must be a non-empty string",
          }),
        )
      }
      if (typeof content !== "string") {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.WRITE,
            reason: "content must be a string",
          }),
        )
      }

      const byteLength = Buffer.byteLength(content, "utf-8")
      if (byteLength > TOOL_CONSTANTS.WRITE_MAX_BYTES) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.WRITE,
            reason: `Content too large (${formatBytes(byteLength)}, max ${formatBytes(TOOL_CONSTANTS.WRITE_MAX_BYTES)})`,
          }),
        )
      }

      const absPath = yield* resolveToolPath(cwd, rawPath, TOOL_NAMES.WRITE)

      yield* Effect.tryPromise({
        try: () => mkdir(dirname(absPath), { recursive: true }),
        catch: (e) =>
          new ToolExecutionError({
            tool: TOOL_NAMES.WRITE,
            reason: `Cannot create directory for: ${absPath}`,
            cause: e,
          }),
      })

      yield* Effect.tryPromise({
        try: () => writeFile(absPath, content, "utf-8"),
        catch: (e) =>
          new ToolExecutionError({
            tool: TOOL_NAMES.WRITE,
            reason: `Cannot write file: ${absPath}`,
            cause: e,
          }),
      })

      const lines = Chunk.size(Chunk.fromIterable(content.split("\n")))
      return `Written ${String(lines)} line(s) to ${absPath}`
    }),
}

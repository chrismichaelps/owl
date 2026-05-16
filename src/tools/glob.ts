/**
 * @Owl.Tools.Glob - Fast file pattern matching using fast-glob
 *
 * Returns matching paths sorted by modification time (newest first),
 * bounded by GLOB_MAX_RESULTS to prevent enumeration of huge trees.
 */
import { stat } from "node:fs/promises"
import fg from "fast-glob"
import { Chunk, Data, Effect, Order } from "effect"
import { TOOL_NAMES, TOOL_CONSTANTS } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import { resolveToolPath } from "./path.js"
import type { BuiltInTool } from "./types.js"

type GlobMatch = Readonly<{
  readonly path: string
  readonly mtime: number
}>

const newestFirst = Order.make<GlobMatch>((left, right) => {
  const delta = right.mtime - left.mtime
  if (delta < 0) return -1
  if (delta > 0) return 1
  const pathDelta = left.path.localeCompare(right.path)
  if (pathDelta < 0) return -1
  if (pathDelta > 0) return 1
  return 0
})

const DESCRIPTION = `Find files matching a glob pattern, sorted by modification time (newest first).

Usage:
- Supports glob syntax: "**/*.ts", "src/**/*.tsx", "*.{json,yaml}"
- Results are capped at ${String(TOOL_CONSTANTS.GLOB_MAX_RESULTS)} paths
- The search root defaults to the project root; use the path parameter to scope it`

export const GlobTool: BuiltInTool = {
  name: TOOL_NAMES.GLOB,
  description: DESCRIPTION,
  input_schema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: 'Glob pattern, e.g. "**/*.ts" or "src/**/*.test.ts"',
      },
      path: {
        type: "string",
        description:
          "Directory to search within (default: project root). Absolute or project-relative.",
      },
    },
    required: ["pattern"],
  },

  execute: (input, cwd) =>
    Effect.gen(function* () {
      const pattern = input.pattern
      if (typeof pattern !== "string" || pattern.trim().length === 0) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.GLOB,
            reason: "pattern must be a non-empty string",
          }),
        )
      }

      const searchRoot =
        typeof input.path === "string" && input.path.trim().length > 0
          ? yield* resolveToolPath(cwd, input.path, TOOL_NAMES.GLOB)
          : cwd

      const matches = yield* Effect.tryPromise({
        try: () =>
          fg(pattern, {
            cwd: searchRoot,
            dot: true,
            followSymbolicLinks: false,
            absolute: true,
            onlyFiles: true,
          }),
        catch: (e) =>
          new ToolExecutionError({
            tool: TOOL_NAMES.GLOB,
            reason: `Glob failed: ${String(e)}`,
            cause: e,
          }),
      })

      if (matches.length === 0) {
        return `No files match pattern "${pattern}" in ${searchRoot}`
      }

      const candidateMatches = Chunk.take(
        Chunk.fromIterable(matches),
        TOOL_CONSTANTS.GLOB_MAX_RESULTS * 2,
      )
      const withMtime = yield* Effect.forEach(candidateMatches, (matchPath) =>
        Effect.tryPromise({
          try: async () => {
            const matchStat = await stat(matchPath).catch(() => null)
            return Data.struct({
              path: matchPath,
              mtime: matchStat?.mtimeMs ?? 0,
            })
          },
          catch: (cause) =>
            new ToolExecutionError({
              tool: TOOL_NAMES.GLOB,
              reason: "Failed to stat matched files",
              cause,
            }),
        }),
      )

      const sorted = Chunk.sort(Chunk.fromIterable(withMtime), newestFirst)
      const bounded = Chunk.take(sorted, TOOL_CONSTANTS.GLOB_MAX_RESULTS)
      const paths = Chunk.toArray(Chunk.map(bounded, (e) => e.path))

      const truncNote =
        matches.length > TOOL_CONSTANTS.GLOB_MAX_RESULTS
          ? `\n… (${String(matches.length - TOOL_CONSTANTS.GLOB_MAX_RESULTS)} more results omitted)`
          : ""

      return paths.join("\n") + truncNote
    }),
}

/** @Owl.Tools.Path - Project-contained tool path resolution */
import path from "node:path"
import { Effect } from "effect"
import { ToolExecutionError } from "../core/errors/index.js"

/** @Owl.Tools.Path.Resolve - Resolves tool paths inside project root */
export const resolveToolPath = (
  cwd: string,
  filePath: string,
  tool: string,
): Effect.Effect<string, ToolExecutionError> =>
  Effect.gen(function* () {
    const trimmed = filePath.trim()
    if (trimmed.length === 0) {
      return yield* Effect.fail(
        new ToolExecutionError({
          tool,
          reason: "path must be a non-empty string",
        }),
      )
    }

    const root = path.resolve(cwd)
    const resolved = path.isAbsolute(trimmed)
      ? path.resolve(trimmed)
      : path.resolve(root, trimmed)
    const insideRoot = resolved === root || resolved.startsWith(root + path.sep)

    if (!insideRoot) {
      return yield* Effect.fail(
        new ToolExecutionError({
          tool,
          reason: "path escapes the project root",
        }),
      )
    }

    return resolved
  })

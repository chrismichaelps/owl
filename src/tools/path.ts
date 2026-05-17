/** @Owl.Tools.Path - Project-contained tool path resolution */
import path from "node:path"
import { Effect } from "effect"
import { ToolExecutionError } from "../core/errors/index.js"

const SEARCH_RESULT_LINE_PATTERN = /^(.+?)([:\-])(\d+)([:\-])(.*)$/

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

/** @Owl.Tools.Path.Display - Formats paths relative to project root */
export function formatToolPath(cwd: string, absPath: string): string {
  const relativePath = path.relative(path.resolve(cwd), path.resolve(absPath))
  if (relativePath.length === 0) {
    return "."
  }
  return relativePath.split(path.sep).join("/")
}

/** @Owl.Tools.Path.SearchOutput - Formats leading search result paths */
export function formatToolSearchOutput(cwd: string, output: string): string {
  const lines = output.split("\n")
  return lines
    .map((line) => {
      const match = SEARCH_RESULT_LINE_PATTERN.exec(line)
      if (match === null) {
        return line
      }
      const [full, filePath, firstSep, lineNumber, secondSep, content] = match
      if (
        filePath === undefined ||
        firstSep === undefined ||
        lineNumber === undefined ||
        secondSep === undefined ||
        content === undefined ||
        !path.isAbsolute(filePath)
      ) {
        return full
      }
      return `${formatToolPath(cwd, filePath)}${firstSep}${lineNumber}${secondSep}${content}`
    })
    .join("\n")
}

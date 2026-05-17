/**
 * @Owl.Tools.Grep - Code search using ripgrep (rg) with grep fallback
 *
 * Prefers `rg` for speed; falls back to `grep -rn` when rg is not available.
 * Output is truncated to GREP_MAX_OUTPUT_CHARS.
 */
import { execFile } from "node:child_process"
import { Chunk, Effect } from "effect"
import { TOOL_NAMES, TOOL_CONSTANTS } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import { formatToolSearchOutput, resolveToolPath } from "./path.js"
import { decodeToolInput } from "./schema.js"
import type { BuiltInTool } from "./types.js"

const DESCRIPTION = `Search for a pattern in files using ripgrep (falls back to grep).

Usage:
- pattern supports full regular expression syntax
- path scopes the search (default: project root)
- include filters by glob pattern, e.g. "*.ts" or "**/*.tsx"
- output shows file:line:match format, truncated to ${String(TOOL_CONSTANTS.GREP_MAX_OUTPUT_CHARS)} characters`

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return (
    text.slice(0, max) +
    `\n… [output truncated, ${String(text.length - max)} chars omitted]`
  )
}

/** Try rg; on ENOENT fall back to grep. Returns [binary, args] */
function buildGrepCommand(
  pattern: string,
  searchPath: string,
  include: string | null,
): [string, string[]] {
  const baseArgs = Chunk.make(
    "--line-number",
    "--no-heading",
    "--color=never",
    `--context=${String(TOOL_CONSTANTS.GREP_CONTEXT_LINES)}`,
  )
  const includeArgs =
    include !== null ? Chunk.make(`--glob=${include}`) : Chunk.empty<string>()
  const args = Chunk.appendAll(
    Chunk.appendAll(baseArgs, includeArgs),
    Chunk.make("--", pattern, searchPath),
  )
  return ["rg", Chunk.toArray(args)]
}

function buildFallbackCommand(
  pattern: string,
  searchPath: string,
  include: string | null,
): [string, string[]] {
  return [
    "grep",
    Chunk.toArray(
      Chunk.make(
        "-rn",
        `--include=${include ?? "*"}`,
        "--",
        pattern,
        searchPath,
      ),
    ),
  ]
}

export const GrepTool: BuiltInTool = {
  name: TOOL_NAMES.GREP,
  description: DESCRIPTION,
  modelVisible: true,
  input_schema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Regular expression pattern to search for",
      },
      path: {
        type: "string",
        description:
          "Directory or file to search within (default: project root)",
      },
      include: {
        type: "string",
        description:
          'Glob to restrict matched files, e.g. "*.ts" or "**/*.tsx"',
      },
    },
    required: ["pattern"],
  },

  execute: (input, cwd) =>
    Effect.gen(function* () {
      const decoded = decodeToolInput(TOOL_NAMES.GREP, input)
      if (decoded instanceof ToolExecutionError) {
        return yield* Effect.fail(decoded)
      }

      if (decoded.pattern.trim().length === 0) {
        return yield* Effect.fail(
          new ToolExecutionError({
            tool: TOOL_NAMES.GREP,
            reason: "pattern must be a non-empty string",
          }),
        )
      }

      const searchPath =
        decoded.path !== undefined && decoded.path.trim().length > 0
          ? yield* resolveToolPath(cwd, decoded.path, TOOL_NAMES.GREP)
          : cwd

      const include =
        decoded.include !== undefined && decoded.include.trim().length > 0
          ? decoded.include
          : null

      const runCommand = (
        binary: string,
        args: string[],
      ): Effect.Effect<string, ToolExecutionError> =>
        Effect.async<string, ToolExecutionError>((resume) => {
          const child = execFile(
            binary,
            args,
            {
              cwd,
              maxBuffer:
                TOOL_CONSTANTS.GREP_MAX_OUTPUT_CHARS *
                TOOL_CONSTANTS.GREP_MAX_BUFFER_MULTIPLIER,
              timeout: TOOL_CONSTANTS.GREP_TIMEOUT_MS,
            },
            (err, stdout, stderr) => {
              // exit code 0 = matches, 1 = no matches (success); anything else = real error
              // string codes (e.g. "ENOENT") also trigger failure so catchIf can handle them
              const rawCode = err?.code
              if (err !== null && rawCode !== 1) {
                resume(
                  Effect.fail(
                    new ToolExecutionError({
                      tool: TOOL_NAMES.GREP,
                      reason:
                        stderr.trim() ||
                        `${binary} exited with code ${String(rawCode)}`,
                      cause: err,
                    }),
                  ),
                )
                return
              }
              const output = truncate(
                formatToolSearchOutput(cwd, stdout),
                TOOL_CONSTANTS.GREP_MAX_OUTPUT_CHARS,
              )
              resume(
                Effect.succeed(
                  output.trim() === "" ? "No matches found." : output,
                ),
              )
            },
          )
          return Effect.sync(() => {
            child.kill()
          })
        })

      const [rgBin, rgArgs] = buildGrepCommand(
        decoded.pattern,
        searchPath,
        include,
      )

      // Try rg; if it's not installed (ENOENT), fall back to system grep
      return yield* runCommand(rgBin, rgArgs).pipe(
        Effect.catchIf(
          (e) =>
            e instanceof ToolExecutionError &&
            typeof e.cause === "object" &&
            e.cause !== null &&
            "code" in e.cause &&
            (e.cause as { code: string }).code === "ENOENT",
          () => {
            const [grepBin, grepArgs] = buildFallbackCommand(
              decoded.pattern,
              searchPath,
              include,
            )
            return runCommand(grepBin, grepArgs)
          },
        ),
      )
    }),
}

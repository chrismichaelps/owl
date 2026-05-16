/**
 * @Owl.Tools.Bash - Shell command execution tool
 *
 * Executes shell commands via execFile('/bin/sh', ['-c', command]) to avoid
 * shell-injection through node's exec(). The shell binary is hardcoded, not
 * interpolated, so the only variable input is the command string — which the
 * AI constructs explicitly, not from raw user text.
 *
 * stdout + stderr are returned combined, truncated to BASH_MAX_OUTPUT_CHARS.
 * A non-zero exit code is surfaced in the output rather than as a failure
 * so the AI can observe and reason about command failures.
 */
import { execFile } from "node:child_process"
import { Effect } from "effect"
import { TOOL_NAMES, TOOL_CONSTANTS } from "../core/constants/index.js"
import { ToolExecutionError } from "../core/errors/index.js"
import type { BuiltInTool } from "./types.js"

const DESCRIPTION = `Execute a shell command in the working directory and return its output.

Usage:
- The command runs in the project root (same directory as where owl was launched)
- stdout and stderr are both captured and returned
- Non-zero exit codes are included in the output so you can observe failures
- Timeout defaults to ${String(TOOL_CONSTANTS.BASH_DEFAULT_TIMEOUT_MS / 1000)}s; override with the timeout_ms parameter (max ${String(TOOL_CONSTANTS.BASH_MAX_TIMEOUT_MS / 1000)}s)
- Output is truncated to ${String(TOOL_CONSTANTS.BASH_MAX_OUTPUT_CHARS)} characters
- Prefer purpose-built tools (Read, Write, Edit, Glob, Grep) over shell equivalents for file operations`

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return (
    text.slice(0, max) +
    `\n… [output truncated, ${String(text.length - max)} chars omitted]`
  )
}

export const BashTool: BuiltInTool = {
  name: TOOL_NAMES.BASH,
  description: DESCRIPTION,
  modelVisible: false,
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The shell command to execute",
      },
      description: {
        type: "string",
        description:
          "Short human-readable description of what this command does",
      },
      timeout_ms: {
        type: "number",
        description: `Execution timeout in milliseconds (default: ${String(TOOL_CONSTANTS.BASH_DEFAULT_TIMEOUT_MS)}, max: ${String(TOOL_CONSTANTS.BASH_MAX_TIMEOUT_MS)})`,
      },
    },
    required: ["command"],
  },

  execute: (input, cwd) => {
    const command = input.command
    if (typeof command !== "string" || command.trim().length === 0) {
      return Effect.fail(
        new ToolExecutionError({
          tool: TOOL_NAMES.BASH,
          reason: "command must be a non-empty string",
        }),
      )
    }

    const rawTimeout =
      typeof input.timeout_ms === "number" ? input.timeout_ms : null
    const timeoutMs =
      rawTimeout !== null
        ? clamp(
            rawTimeout,
            TOOL_CONSTANTS.BASH_MIN_TIMEOUT_MS,
            TOOL_CONSTANTS.BASH_MAX_TIMEOUT_MS,
          )
        : TOOL_CONSTANTS.BASH_DEFAULT_TIMEOUT_MS

    return Effect.async<string, ToolExecutionError>((resume) => {
      const child = execFile(
        TOOL_CONSTANTS.BASH_SHELL,
        ["-c", command],
        {
          cwd,
          timeout: timeoutMs,
          maxBuffer:
            TOOL_CONSTANTS.BASH_MAX_OUTPUT_CHARS *
            TOOL_CONSTANTS.BASH_MAX_BUFFER_MULTIPLIER,
          env: { ...process.env },
        },
        (err, stdout, stderr) => {
          const combined = [stdout, stderr].filter(Boolean).join("")
          const output = truncate(
            combined,
            TOOL_CONSTANTS.BASH_MAX_OUTPUT_CHARS,
          )

          if (err?.killed) {
            resume(
              Effect.succeed(
                `[Timed out after ${String(timeoutMs)}ms]\n${output}`,
              ),
            )
            return
          }

          const exitCode = err?.code ?? 0
          const header =
            exitCode !== 0 ? `[Exit code: ${String(exitCode)}]\n` : ""
          resume(Effect.succeed(header + output))
        },
      )
      return Effect.sync(() => {
        child.kill()
      })
    })
  },
}

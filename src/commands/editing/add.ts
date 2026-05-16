/**
 * @Owl.Commands.Editing.Add - Inject file contents into conversation context: /add <file>
 *
 * Reads one or more files from disk and prepends them as a user message in the
 * ContextManager so the next inference sees the file content automatically.
 *
 * Usage:
 *   /add src/engine/orchestrator/index.ts
 *   /add src/providers/anthropic/index.ts src/providers/types.ts
 *
 * The file content is shown in the conversation thread as a "context" turn so
 * the user knows what was loaded.
 *
 * @example
 * /add CLAUDE.md
 * // ✓ Added 1 file to context: CLAUDE.md (3.2kb)
 */
import { readFile, stat } from "node:fs/promises"
import { resolve, relative, basename } from "node:path"
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import { CommandParseError as CommandParseErrorClass } from "../../core/errors/index.js"
import type { ContextManagerService } from "../../engine/context/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const MAX_FILE_BYTES = 500_000 // 500 KB per file
const MAX_TOTAL_BYTES = 1_000_000 // 1 MB total across all files

/** Format a byte count as a human-readable string */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)}b`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`
}

/**
 * @Owl.Commands.Editing.Add.Factory - Create the /add command handler
 */
export function makeAddCommand(
  contextManager: ContextManagerService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "add",
    description:
      "Inject file contents into context for the next inference: /add <file> [file2 ...]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      if (args.length === 0) {
        return Effect.fail(
          new CommandParseErrorClass({
            input: "add",
            reason: "Provide at least one file path: /add <file>",
          }),
        )
      }

      return Effect.gen(function* () {
        const loaded: { path: string; content: string; bytes: number }[] = []
        let totalBytes = 0

        for (const rawPath of args) {
          const absPath = resolve(projectRoot, rawPath)

          // Stat the file first to check size
          const info = yield* Effect.tryPromise({
            try: () => stat(absPath),
            catch: () =>
              new CommandParseErrorClass({
                input: "add",
                reason: `File not found: ${rawPath}`,
              }),
          })

          if (!info.isFile()) {
            return yield* Effect.fail(
              new CommandParseErrorClass({
                input: "add",
                reason: `Not a file: ${rawPath}`,
              }),
            )
          }

          if (info.size > MAX_FILE_BYTES) {
            return yield* Effect.fail(
              new CommandParseErrorClass({
                input: "add",
                reason: `File too large (${formatBytes(info.size)}): ${rawPath}. Max: ${formatBytes(MAX_FILE_BYTES)}`,
              }),
            )
          }

          totalBytes += info.size
          if (totalBytes > MAX_TOTAL_BYTES) {
            return yield* Effect.fail(
              new CommandParseErrorClass({
                input: "add",
                reason: `Total file size exceeds limit (${formatBytes(MAX_TOTAL_BYTES)})`,
              }),
            )
          }

          const content = yield* Effect.tryPromise({
            try: () => readFile(absPath, "utf8"),
            catch: (e) =>
              new CommandParseErrorClass({
                input: "add",
                reason: `Failed to read ${rawPath}: ${e instanceof Error ? e.message : String(e)}`,
              }),
          })

          loaded.push({
            path: relative(projectRoot, absPath),
            content,
            bytes: info.size,
          })
        }

        // Build a structured user message with all file contents
        const fileBlocks = loaded
          .map(
            ({ path, content }) => `<file path="${path}">\n${content}\n</file>`,
          )
          .join("\n\n")

        const contextMsg = `The following files have been added to context:\n\n${fileBlocks}`

        yield* contextManager.addMessage({
          role: "user",
          content: contextMsg,
          timestamp: new Date().toISOString(),
        })

        const summary = loaded
          .map(
            ({ path, bytes }) =>
              `  • ${basename(path)} (${formatBytes(bytes)})`,
          )
          .join("\n")

        return {
          output:
            `✓ Added ${String(loaded.length)} file${loaded.length === 1 ? "" : "s"} to context:\n${summary}\n\n` +
            `File content is now included in the next inference.`,
        }
      })
    },
  }
}

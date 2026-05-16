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
import { relative, basename } from "node:path"
import { Chunk, Data, Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { resolveProjectPath } from "../../core/path/index.js"
import { formatBytes } from "../../core/utils/format.js"
import type { CommandParseError } from "../../core/errors/index.js"
import { CommandParseError as CommandParseErrorClass } from "../../core/errors/index.js"
import type { ContextManagerService } from "../../engine/context/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

interface LoadedFile {
  readonly path: string
  readonly content: string
  readonly bytes: number
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
        let loaded = Chunk.empty<LoadedFile>()
        let totalBytes = 0

        for (const rawPath of args) {
          const absPath = yield* resolveProjectPath(
            projectRoot,
            rawPath,
            "add",
          ).pipe(
            Effect.mapError(
              (err) =>
                new CommandParseErrorClass({
                  input: "add",
                  reason: `${rawPath}: ${err.reason}`,
                }),
            ),
          )

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

          if (info.size > COMMAND_CONSTANTS.ADD_MAX_FILE_BYTES) {
            return yield* Effect.fail(
              new CommandParseErrorClass({
                input: "add",
                reason: `File too large (${formatBytes(info.size)}): ${rawPath}. Max: ${formatBytes(COMMAND_CONSTANTS.ADD_MAX_FILE_BYTES)}`,
              }),
            )
          }

          totalBytes += info.size
          if (totalBytes > COMMAND_CONSTANTS.ADD_MAX_TOTAL_BYTES) {
            return yield* Effect.fail(
              new CommandParseErrorClass({
                input: "add",
                reason: `Total file size exceeds limit (${formatBytes(COMMAND_CONSTANTS.ADD_MAX_TOTAL_BYTES)})`,
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

          loaded = Chunk.append(
            loaded,
            Data.struct({
              path: relative(projectRoot, absPath),
              content,
              bytes: info.size,
            }),
          )
        }

        // Build a structured user message with all file contents
        const fileBlocks = Chunk.toReadonlyArray(
          Chunk.map(
            loaded,
            ({ path, content }) => `<file path="${path}">\n${content}\n</file>`,
          ),
        ).join("\n\n")

        const contextMsg = `The following files have been added to context:\n\n${fileBlocks}`

        yield* contextManager.addMessage({
          role: "user",
          content: contextMsg,
          timestamp: new Date().toISOString(),
        })

        const summary = Chunk.toReadonlyArray(
          Chunk.map(
            loaded,
            ({ path, bytes }) =>
              `  • ${basename(path)} (${formatBytes(bytes)})`,
          ),
        ).join("\n")

        const loadedCount = Chunk.size(loaded)
        return {
          output:
            `✓ Added ${String(loadedCount)} file${loadedCount === 1 ? "" : "s"} to context:\n${summary}\n\n` +
            `File content is now included in the next inference.`,
        }
      })
    },
  }
}

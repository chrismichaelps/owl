/**
 * @Owl.Commands.Management.Export - Export conversation to markdown: /export
 *
 * Writes all session turns to a markdown file in the project root.
 * Each turn is rendered as a headed section with the user prompt
 * and Owl response, separated by horizontal rules.
 *
 * @example
 * /export
 * // Exported 5 turns → owl-export-1715812345678.md
 *
 * /export my-conversation
 * // Exported 5 turns → my-conversation.md
 */
import { writeFile } from "node:fs/promises"
import { basename } from "node:path"
import { Chunk, Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import { resolveProjectPath } from "../../core/path/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { SessionTurn } from "../../engine/memory/schema.js"
import type { CommandHandler, CommandResult } from "../types.js"

const ensureMarkdownFilename = (rawName: string): string =>
  rawName.endsWith(COMMAND_CONSTANTS.EXPORT_MARKDOWN_EXTENSION)
    ? rawName
    : rawName + COMMAND_CONSTANTS.EXPORT_MARKDOWN_EXTENSION

const formatTurn = (turn: SessionTurn, index: number): string =>
  `## Turn ${String(index + 1)}\n\n**You:** ${turn.prompt}\n\n**Owl:** ${
    turn.response
  }\n\n---\n`

/**
 * @Owl.Commands.Management.Export.Factory - Create the /export command handler
 */
export function makeExportCommand(
  sessionMemory: SessionMemoryService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "export",
    description: "Export conversation to markdown: /export [filename]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const turns = yield* sessionMemory.getTurns()
        const sessionId = yield* sessionMemory.getSessionId()

        const rawName =
          args[0] ?? `${COMMAND_CONSTANTS.EXPORT_DEFAULT_PREFIX}-${sessionId}`
        const filename = ensureMarkdownFilename(rawName)
        const filePath = yield* resolveProjectPath(
          projectRoot,
          filename,
          "export",
        ).pipe(
          Effect.mapError(
            (err) =>
              new CommandParseError({
                input: "/export " + rawName,
                reason: err.reason,
              }),
          ),
        )

        const header = `# Owl Conversation Export\n\nExported: ${new Date().toISOString()}\n\n---\n\n`
        const body =
          turns.length === 0
            ? "_No turns in this session._\n"
            : Chunk.toReadonlyArray(
                Chunk.map(Chunk.fromIterable(turns), formatTurn),
              ).join("\n")

        yield* Effect.tryPromise({
          try: () => writeFile(filePath, header + body, "utf8"),
          catch: (cause) =>
            new CommandParseError({
              input: "/export " + rawName,
              reason:
                cause instanceof Error ? cause.message : "Unable to export",
            }),
        })

        return {
          output: `Exported ${String(turns.length)} turn${
            turns.length === 1 ? "" : "s"
          } → ${basename(filePath)}`,
        }
      }),
  }
}

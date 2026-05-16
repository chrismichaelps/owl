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
import { join } from "node:path"
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

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

        const rawName = args[0] ?? `owl-export-${Date.now()}`
        const filename = rawName.endsWith(".md") ? rawName : `${rawName}.md`
        const filePath = join(projectRoot, filename)

        const header = `# Owl Conversation Export\n\nExported: ${new Date().toISOString()}\n\n---\n\n`
        const body =
          turns.length === 0
            ? "_No turns in this session._\n"
            : turns
                .map(
                  (turn, i) =>
                    `## Turn ${String(i + 1)}\n\n**You:** ${turn.prompt}\n\n**Owl:** ${turn.response}\n\n---\n`,
                )
                .join("\n")

        yield* Effect.promise(() => writeFile(filePath, header + body, "utf8"))

        return {
          output: `Exported ${String(turns.length)} turn${turns.length === 1 ? "" : "s"} → ${filename}`,
        }
      }),
  }
}

/** @Owl.Commands.Management.Memory - Display session turn history: /memory */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREVIEW_LENGTH = 80

function truncate(s: string): string {
  return s.length > PREVIEW_LENGTH ? s.slice(0, PREVIEW_LENGTH) + "…" : s
}

export function makeMemoryCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "memory",
    description: "Display recent session turn history: /memory",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      sessionMemory.getTurns().pipe(
        Effect.map((turns) => {
          if (turns.length === 0) {
            return { output: "No session turns recorded." }
          }
          const lines = turns.map(
            (t, i) =>
              "[" +
              String(i + 1) +
              "] " +
              t.timestamp +
              " (" +
              String(t.tokensUsed) +
              " tokens)\n" +
              "  Q: " +
              truncate(t.prompt) +
              "\n" +
              "  A: " +
              truncate(t.response),
          )
          return { output: lines.join("\n\n") }
        }),
      ),
  }
}

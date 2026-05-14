/**
 * @Owl.Commands.Management.Memory - Display session turn history: /memory
 *
 * Shows all conversation turns in the current session.
 * Each turn shows timestamp, token count, and truncated prompt/response.
 *
 * @example
 * /memory
 * // [1] 2024-01-15T10:30:00Z (1250 tokens)
 * //   Q: Create a function...
 * //   A: Here is your function...
 */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREVIEW_LENGTH = 80

/** Truncate long strings for display */
function truncate(s: string): string {
  return s.length > PREVIEW_LENGTH ? s.slice(0, PREVIEW_LENGTH) + "…" : s
}

/**
 * @Owl.Commands.Management.Memory.Factory - Create the /memory command handler
 */
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

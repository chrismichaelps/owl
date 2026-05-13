/** @Owl.Commands.Management.Status - Display session status: /status */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export function makeStatusCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "status",
    description: "Display current session status and turn count: /status",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      sessionMemory.getTurns().pipe(
        Effect.map((turns) => {
          const totalTokens = turns.reduce((sum, t) => sum + t.tokensUsed, 0)
          const output =
            "Session turns: " +
            String(turns.length) +
            "\nTotal tokens used: " +
            String(totalTokens) +
            (turns.length > 0
              ? "\nLast turn: " + (turns[turns.length - 1]?.timestamp ?? "")
              : "")
          return { output }
        }),
      ),
  }
}

/**
 * @Owl.Commands.Management.Status - Display session status: /status
 *
 * Shows current session statistics:
 * - Turn count
 * - Total tokens used
 * - Last turn timestamp
 *
 * @example
 * /status
 * // Session turns: 5
 * // Total tokens used: 15420
 * // Last turn: 2024-01-15T10:35:00Z
 */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Management.Status.Factory - Create the /status command handler
 */
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

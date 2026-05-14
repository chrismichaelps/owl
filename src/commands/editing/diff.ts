/**
 * @Owl.Commands.Editing.Diff - Show rollback entries for a mutation: /diff <mutationId>
 *
 * Displays the rollback snapshot entries for a given mutation ID.
 * Shows file path and timestamp for each registered snapshot.
 *
 * @example
 * /diff edit-abc123
 * // src/foo.ts (snapshot at 2024-01-15T10:30:00Z)
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { RollbackSystemService } from "../../editor/rollback/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Editing.Diff.Factory - Create the /diff command handler
 */
export function makeDiffCommand(
  rollback: RollbackSystemService,
): CommandHandler {
  return {
    name: "diff",
    description: "Show rollback entries for a mutation ID: /diff <mutationId>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const mutationId = args[0]
      if (mutationId === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/diff",
            reason: "Mutation ID is required",
          }),
        )
      }
      return rollback.getEntries(mutationId).pipe(
        Effect.map((entries) => {
          if (entries.length === 0) {
            return { output: "No rollback entries for mutation: " + mutationId }
          }
          const lines = entries.map(
            (e) => e.file + " (snapshot at " + e.timestamp + ")",
          )
          return { output: lines.join("\n") }
        }),
      )
    },
  }
}

/**
 * @Owl.Commands.Editing.Undo - Roll back a mutation by ID: /undo <mutationId>
 *
 * Restores all files in the specified mutation to their pre-mutation state.
 * The mutationId is returned from /edit and /inject commands.
 *
 * @example
 * /undo edit-abc123
 * // Rolled back 2 file(s): src/foo.ts, src/bar.ts
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { RollbackSystemService } from "../../editor/rollback/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Editing.Undo.Factory - Create the /undo command handler
 */
export function makeUndoCommand(
  rollback: RollbackSystemService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "undo",
    description: "Roll back a mutation by ID: /undo <mutationId>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const mutationId = args[0]
      if (mutationId === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/undo",
            reason: "Mutation ID is required",
          }),
        )
      }
      return rollback.rollback(mutationId, projectRoot).pipe(
        Effect.map((restoredFiles) => ({
          output:
            "Rolled back " +
            String(restoredFiles.length) +
            " file(s): " +
            restoredFiles.join(", "),
        })),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/undo", reason: String(err) }),
          ),
        ),
      )
    },
  }
}

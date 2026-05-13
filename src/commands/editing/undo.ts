/** @Owl.Commands.Editing.Undo - Roll back a mutation by ID: /undo <mutationId> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { RollbackSystemService } from "../../editor/rollback/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

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

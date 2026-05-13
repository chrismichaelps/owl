/** @Owl.Commands.Editing.Apply - Informational: edits are applied immediately by /edit */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export function makeApplyCommand(): CommandHandler {
  return {
    name: "apply",
    description:
      "Apply a pending edit (edits are written immediately by /edit)",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.succeed({
        output:
          "Edits are applied immediately when using /edit or /inject. Use /undo <mutationId> to revert a previous mutation.",
      }),
  }
}

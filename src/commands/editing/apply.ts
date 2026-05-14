/**
 * @Owl.Commands.Editing.Apply - Informational: edits are applied immediately by /edit
 *
 * This command is informational — it explains that edits are applied immediately
 * and tells users how to undo if needed.
 *
 * Edits via /edit and /inject are written immediately (auto-approve).
 * Use /undo <mutationId> to revert.
 */
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Editing.Apply.Factory - Create the /apply command handler
 */
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

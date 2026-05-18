/** @Owl.Commands.Editing.Pending - Inspect pending edit approval queue */
import { Chunk, Effect } from "effect"
import { formatPendingMutationLine } from "../../editor/pending/format.js"
import type { PendingMutationStoreService } from "../../editor/pending/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/** @Owl.Commands.Editing.Pending.Format - Render approval inbox */
export const formatPendingMutations = (
  lines: Chunk.Chunk<string>,
): string =>
  Chunk.isEmpty(lines)
    ? "No pending mutations. Preview first with /edit --preview."
    : "Pending mutations:\n" +
      Chunk.toReadonlyArray(lines).join("\n") +
      "\n\nRun /diff <mutationId>, /apply <mutationId>, or /reject <mutationId>."

/** @Owl.Commands.Editing.Pending.Factory - Create the /pending command handler */
export function makePendingCommand(
  pending: PendingMutationStoreService,
): CommandHandler {
  return {
    name: "pending",
    description: "Show pending edit approvals: /pending",
    execute: (): Effect.Effect<CommandResult> =>
      pending.list().pipe(
        Effect.map((mutations) => ({
          output: formatPendingMutations(
            Chunk.map(mutations, formatPendingMutationLine),
          ),
        })),
      ),
  }
}

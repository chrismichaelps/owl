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
import { Chunk, Option } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import { formatMutationImpactBlock } from "../../editor/diff/impact.js"
import type { PendingMutationStoreService } from "../../editor/pending/index.js"
import type { PipelineMutationResult } from "../../editor/pipeline/index.js"
import type { RollbackSystemService } from "../../editor/rollback/index.js"
import {
  formatSideBySideDiff,
  formatUnifiedDiff,
} from "../../editor/utils/patch.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatPreviewDiff = (
  preview: PipelineMutationResult,
  sideBySide: boolean,
): string => {
  const rendered = sideBySide
    ? formatSideBySideDiff(preview.file, preview.diff.hunks)
    : formatUnifiedDiff(preview.file, preview.diff.hunks)
  const fence = sideBySide ? "text" : "diff"
  return (
    preview.file +
    "\n" +
    formatMutationImpactBlock([preview.diff]) +
    "\n\n```" +
    fence +
    "\n" +
    rendered +
    "\n```"
  )
}

/**
 * @Owl.Commands.Editing.Diff.Factory - Create the /diff command handler
 */
export function makeDiffCommand(
  rollback: RollbackSystemService,
  pending: PendingMutationStoreService,
): CommandHandler {
  return {
    name: "diff",
    description: "Show mutation diffs: /diff <mutationId> [--side-by-side]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const mutationId = args[0]
      const sideBySide = args.includes(COMMAND_CONSTANTS.DIFF_SIDE_BY_SIDE_FLAG)
      if (mutationId === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/diff",
            reason: "Mutation ID is required",
          }),
        )
      }
      return Effect.gen(function* () {
        const pendingMutation = yield* pending.get(mutationId)
        if (Option.isSome(pendingMutation)) {
          const previews = pendingMutation.value.previews
          if (!Chunk.isEmpty(previews)) {
            const sections = Chunk.map(previews, (preview) => {
              return formatPreviewDiff(preview, sideBySide)
            })
            return { output: Chunk.toReadonlyArray(sections).join("\n\n") }
          }
        }

        const entries = yield* rollback.getEntries(mutationId)
        const snapshots = Chunk.fromIterable(entries)
        if (Chunk.isEmpty(snapshots)) {
          return { output: "No rollback entries for mutation: " + mutationId }
        }
        const lines = Chunk.map(
          snapshots,
          (entry) => entry.file + " (snapshot at " + entry.timestamp + ")",
        )
        return { output: Chunk.toReadonlyArray(lines).join("\n") }
      })
    },
  }
}

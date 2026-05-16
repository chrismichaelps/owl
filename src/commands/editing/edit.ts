/**
 * @Owl.Commands.Editing.Edit - Surgical string replacement via TLI: /edit <file> "<old>" "<new>"
 *
 * Applies a surgical string replacement using the Mutation Pipeline.
 * Automatically goes through:
 * 1. Planning (find old string)
 * 2. Diff generation (compute change impact)
 * 3. Shard Split check (>15% triggers warning)
 * 4. Auto-approval (writes immediately)
 * 5. Rollback registration (on failure, restore)
 *
 * Arguments: <file> "<old_string>" "<new_string>"
 *
 * @example
 * /edit src/utils.ts "const x = 1" "const x: number = 1"
 */
import { Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type { PendingMutationStoreService } from "../../editor/pending/index.js"
import type { EditingPipelineService } from "../../editor/pipeline/index.js"
import type { PipelineResult } from "../../editor/pipeline/index.js"
import { formatUnifiedDiff } from "../../editor/utils/patch.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeMutationId } from "../utils/ids.js"

/** @Owl.Commands.Editing.Edit.Format - Summarize applied mutation with diff */
export function formatEditOutput(
  file: string,
  mutationId: string,
  result: PipelineResult,
): string {
  const first = result.results[0]
  if (first === undefined) {
    return "No changes applied"
  }

  const header =
    "Edited " +
    file +
    " — " +
    String(first.diff.linesAdded) +
    " lines added, " +
    String(first.diff.linesRemoved) +
    " removed | mutation " +
    mutationId
  const patch = formatUnifiedDiff(first.file, first.diff.hunks)

  return patch.length > 0 ? header + "\n\n```diff\n" + patch + "\n```" : header
}

/**
 * @Owl.Commands.Editing.Edit.Factory - Create the /edit command handler
 */
export function makeEditCommand(
  pipeline: EditingPipelineService,
  pending: PendingMutationStoreService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "edit",
    description:
      'Apply a surgical string replacement: /edit <file> "<old>" "<new>"',
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const preview = args[0] === COMMAND_CONSTANTS.EDIT_PREVIEW_FLAG
      const commandArgs = preview ? args.slice(1) : args
      const [file, oldString, newString] = commandArgs
      if (
        file === undefined ||
        oldString === undefined ||
        newString === undefined
      ) {
        return Effect.fail(
          new CommandParseError({
            input: "/edit",
            reason: 'Usage: /edit <file> "<old_string>" "<new_string>"',
          }),
        )
      }
      const mutationId = makeMutationId("edit", file, [oldString, newString])
      if (preview) {
        return pipeline
          .execute({
            mutationId,
            targets: [{ file, oldString, newString }],
            projectRoot,
            autoApprove: false,
          })
          .pipe(
            Effect.flatMap((result) =>
              pending.put(mutationId, [{ file, oldString, newString }]).pipe(
                Effect.map(() => ({
                  output:
                    formatEditOutput(file, mutationId, result) +
                    "\n\nPending approval. Run /apply " +
                    mutationId +
                    " to write this change.",
                })),
              ),
            ),
            Effect.catchAll((err) =>
              Effect.fail(
                new CommandParseError({ input: "/edit", reason: String(err) }),
              ),
            ),
          )
      }
      return pipeline
        .execute({
          mutationId,
          targets: [{ file, oldString, newString }],
          projectRoot,
          autoApprove: true,
        })
        .pipe(
          Effect.map((result) => ({
            output: formatEditOutput(file, mutationId, result),
          })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/edit", reason: String(err) }),
            ),
          ),
        )
    },
  }
}

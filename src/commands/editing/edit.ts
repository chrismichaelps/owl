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
import { CommandParseError } from "../../core/errors/index.js"
import type { EditingPipelineService } from "../../editor/pipeline/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeMutationId } from "../utils/ids.js"

/**
 * @Owl.Commands.Editing.Edit.Factory - Create the /edit command handler
 */
export function makeEditCommand(
  pipeline: EditingPipelineService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "edit",
    description:
      'Apply a surgical string replacement: /edit <file> "<old>" "<new>"',
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const [file, oldString, newString] = args
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
      return pipeline
        .execute({
          mutationId,
          targets: [{ file, oldString, newString }],
          projectRoot,
          autoApprove: true,
        })
        .pipe(
          Effect.map((result) => ({
            output:
              result.results.length > 0
                ? "Edited " +
                  file +
                  " — " +
                  String(result.results[0]?.diff.linesAdded ?? 0) +
                  " lines added, " +
                  String(result.results[0]?.diff.linesRemoved ?? 0) +
                  " removed | mutation " +
                  mutationId
                : "No changes applied",
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

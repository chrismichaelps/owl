/** @Owl.Commands.Editing.Apply - Apply previewed Mutation proposals */
import { Chunk, Effect, Option } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { PendingMutationStoreService } from "../../editor/pending/index.js"
import type { EditingPipelineService } from "../../editor/pipeline/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Editing.Apply.Factory - Create the /apply command handler
 */
export function makeApplyCommand(
  pipeline: EditingPipelineService,
  pending: PendingMutationStoreService,
  projectRoot: string,
): CommandHandler {
  return {
    name: "apply",
    description: "Apply a pending edit preview: /apply <mutationId>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const mutationId = args[0]
      if (mutationId === undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/apply",
            reason:
              "Mutation ID is required. Preview first with /edit --preview.",
          }),
        )
      }

      return Effect.gen(function* () {
        const mutationOpt = yield* pending.get(mutationId)
        if (Option.isNone(mutationOpt)) {
          return yield* Effect.fail(
            new CommandParseError({
              input: "/apply " + mutationId,
              reason: "No pending mutation found for " + mutationId,
            }),
          )
        }

        const mutation = mutationOpt.value
        const result = yield* pipeline.execute({
          mutationId: mutation.mutationId,
          targets: Chunk.toReadonlyArray(mutation.targets),
          projectRoot,
          autoApprove: true,
        })
        yield* pending.remove(mutationId)

        return {
          output:
            "Applied " +
            mutationId +
            " across " +
            String(result.results.length) +
            " file(s). Use /undo " +
            mutationId +
            " to restore the previous content.",
        }
      }).pipe(
        Effect.catchAll((err) =>
          Effect.fail(
            err instanceof CommandParseError
              ? err
              : new CommandParseError({
                  input: "/apply " + mutationId,
                  reason: String(err),
                }),
          ),
        ),
      )
    },
  }
}

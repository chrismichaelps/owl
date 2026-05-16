/** @Owl.Commands.Editing.Apply - Apply previewed Mutation proposals */
import { Chunk, Effect, Option } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type {
  PendingMutation,
  PendingMutationStoreService,
} from "../../editor/pending/index.js"
import { selectPendingMutationTargets } from "../../editor/pending/selection.js"
import type { EditingPipelineService } from "../../editor/pipeline/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatPendingMutation = (mutation: PendingMutation): string => {
  const files = Chunk.map(mutation.targets, (target) => target.file)
  return (
    mutation.mutationId +
    " — " +
    Chunk.toReadonlyArray(files).join(", ") +
    " (" +
    mutation.createdAt +
    ")"
  )
}

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
    description: "Apply pending edit previews: /apply <mutationId|--all>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const mutationId = args[0]
      if (mutationId === undefined) {
        return pending.list().pipe(
          Effect.map((mutations) => {
            if (Chunk.isEmpty(mutations)) {
              return {
                output:
                  "No pending mutations. Preview first with /edit --preview.",
              }
            }
            const lines = Chunk.map(mutations, formatPendingMutation)
            return {
              output:
                "Pending mutations:\n" +
                Chunk.toReadonlyArray(lines).join("\n") +
                "\n\nRun /apply <mutationId> or /apply --all.",
            }
          }),
        )
      }

      const applyOne = (id: string, selectedFiles = Chunk.empty<string>()) =>
        Effect.gen(function* () {
          const mutationOpt = yield* pending.get(id)
          if (Option.isNone(mutationOpt)) {
            return yield* Effect.fail(
              new CommandParseError({
                input: "/apply " + id,
                reason: "No pending mutation found for " + id,
              }),
            )
          }

          const mutation = mutationOpt.value
          const selection = selectPendingMutationTargets(
            mutation,
            selectedFiles,
          )
          if (!Chunk.isEmpty(selection.unknownFiles)) {
            return yield* Effect.fail(
              new CommandParseError({
                input: "/apply " + mutation.mutationId,
                reason:
                  "Unknown file(s) for pending mutation: " +
                  Chunk.toReadonlyArray(selection.unknownFiles).join(", "),
              }),
            )
          }

          const result = yield* pipeline.execute({
            mutationId: mutation.mutationId,
            targets: Chunk.toReadonlyArray(selection.selectedTargets),
            projectRoot,
            autoApprove: true,
          })

          if (Chunk.isEmpty(selection.remainingTargets)) {
            yield* pending.remove(id)
          } else {
            yield* pending.put(
              id,
              Chunk.toReadonlyArray(selection.remainingTargets),
              Chunk.toReadonlyArray(selection.remainingPreviews),
            )
          }

          const appliedFiles = Chunk.map(
            selection.selectedTargets,
            (target) => target.file,
          )
          const remainingFiles = Chunk.map(
            selection.remainingTargets,
            (target) => target.file,
          )
          return (
            id +
            " across " +
            String(result.results.length) +
            " file(s): " +
            Chunk.toReadonlyArray(appliedFiles).join(", ") +
            (Chunk.isEmpty(remainingFiles)
              ? ""
              : " | remaining: " +
                Chunk.toReadonlyArray(remainingFiles).join(", "))
          )
        })

      return Effect.gen(function* () {
        if (mutationId === COMMAND_CONSTANTS.APPLY_ALL_FLAG) {
          const mutations = yield* pending.list()
          if (Chunk.isEmpty(mutations)) {
            return { output: "No pending mutations to apply." }
          }
          const applied = yield* Effect.forEach(
            mutations,
            (mutation) => applyOne(mutation.mutationId),
            { concurrency: 1 },
          )
          return {
            output:
              "Applied pending mutations:\n" +
              Chunk.toReadonlyArray(Chunk.fromIterable(applied)).join("\n"),
          }
        }

        const applied = yield* applyOne(
          mutationId,
          Chunk.fromIterable(args.slice(1)),
        )

        return {
          output:
            "Applied " +
            applied +
            ". Use /undo " +
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

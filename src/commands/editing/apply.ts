/** @Owl.Commands.Editing.Apply - Apply previewed Mutation proposals */
import { Chunk, Effect, HashSet, Option } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type {
  PendingMutation,
  PendingMutationStoreService,
} from "../../editor/pending/index.js"
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

const selectTargets = (
  mutation: PendingMutation,
  selectedFiles: Chunk.Chunk<string>,
): Effect.Effect<
  {
    readonly targetsToApply: typeof mutation.targets
    readonly remainingTargets: typeof mutation.targets
    readonly remainingPreviews: typeof mutation.previews
  },
  CommandParseError
> => {
  if (Chunk.isEmpty(selectedFiles)) {
    return Effect.succeed({
      targetsToApply: mutation.targets,
      remainingTargets: Chunk.empty(),
      remainingPreviews: Chunk.empty(),
    })
  }

  const selectedSet = HashSet.fromIterable(selectedFiles)
  const targetFileSet = HashSet.fromIterable(
    Chunk.map(mutation.targets, (target) => target.file),
  )
  const unknownFiles = Chunk.filter(
    selectedFiles,
    (file) => !HashSet.has(targetFileSet, file),
  )

  if (!Chunk.isEmpty(unknownFiles)) {
    return Effect.fail(
      new CommandParseError({
        input: "/apply " + mutation.mutationId,
        reason:
          "Unknown file(s) for pending mutation: " +
          Chunk.toReadonlyArray(unknownFiles).join(", "),
      }),
    )
  }

  const targetsToApply = Chunk.filter(mutation.targets, (target) =>
    HashSet.has(selectedSet, target.file),
  )
  const remainingTargets = Chunk.filter(
    mutation.targets,
    (target) => !HashSet.has(selectedSet, target.file),
  )
  const remainingFileSet = HashSet.fromIterable(
    Chunk.map(remainingTargets, (target) => target.file),
  )
  const remainingPreviews = Chunk.filter(mutation.previews, (preview) =>
    HashSet.has(remainingFileSet, preview.file),
  )

  return Effect.succeed({
    targetsToApply,
    remainingTargets,
    remainingPreviews,
  })
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
          const { targetsToApply, remainingTargets, remainingPreviews } =
            yield* selectTargets(mutation, selectedFiles)
          const result = yield* pipeline.execute({
            mutationId: mutation.mutationId,
            targets: Chunk.toReadonlyArray(targetsToApply),
            projectRoot,
            autoApprove: true,
          })

          if (Chunk.isEmpty(remainingTargets)) {
            yield* pending.remove(id)
          } else {
            yield* pending.put(
              id,
              Chunk.toReadonlyArray(remainingTargets),
              Chunk.toReadonlyArray(remainingPreviews),
            )
          }

          const appliedFiles = Chunk.map(
            targetsToApply,
            (target) => target.file,
          )
          const remainingFiles = Chunk.map(
            remainingTargets,
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

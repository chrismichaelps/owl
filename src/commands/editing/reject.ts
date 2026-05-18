/** @Owl.Commands.Editing.Reject - Reject previewed Mutation proposals */
import { Chunk, Effect, Option } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type { PendingMutationStoreService } from "../../editor/pending/index.js"
import { formatPendingMutationLine } from "../../editor/pending/format.js"
import { selectPendingMutationTargets } from "../../editor/pending/selection.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatRejectedFiles = (
  mutationId: string,
  rejectedFiles: Chunk.Chunk<string>,
  remainingFiles: Chunk.Chunk<string>,
): string =>
  "Rejected " +
  mutationId +
  " for " +
  Chunk.toReadonlyArray(rejectedFiles).join(", ") +
  (Chunk.isEmpty(remainingFiles)
    ? "."
    : ". Remaining pending files: " +
      Chunk.toReadonlyArray(remainingFiles).join(", ") +
      ".")

/** @Owl.Commands.Editing.Reject.Factory - Create the /reject command handler */
export function makeRejectCommand(
  pending: PendingMutationStoreService,
): CommandHandler {
  return {
    name: "reject",
    description: "Reject pending edit previews: /reject <mutationId|--all>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const mutationId = args[0]
        if (mutationId === undefined) {
          const mutations = yield* pending.list()
          if (Chunk.isEmpty(mutations)) {
            return { output: "No pending mutations to reject." }
          }

          return {
            output:
              "Pending mutations:\n" +
              Chunk.toReadonlyArray(
                Chunk.map(mutations, formatPendingMutationLine),
              ).join("\n") +
              "\n\nRun /reject <mutationId> [file...] or /reject --all.",
          }
        }

        if (mutationId === COMMAND_CONSTANTS.REJECT_ALL_FLAG) {
          const mutations = yield* pending.list()
          if (Chunk.isEmpty(mutations)) {
            return { output: "No pending mutations to reject." }
          }

          yield* Effect.forEach(
            mutations,
            (mutation) => pending.remove(mutation.mutationId),
            { discard: true },
          )

          return {
            output:
              "Rejected pending mutations:\n" +
              Chunk.toReadonlyArray(
                Chunk.map(mutations, (mutation) => mutation.mutationId),
              ).join("\n"),
          }
        }

        const mutationOpt = yield* pending.get(mutationId)
        if (Option.isNone(mutationOpt)) {
          return yield* Effect.fail(
            new CommandParseError({
              input: "/reject " + mutationId,
              reason: "No pending mutation found for " + mutationId,
            }),
          )
        }

        const mutation = mutationOpt.value
        const selection = selectPendingMutationTargets(
          mutation,
          Chunk.fromIterable(args.slice(1)),
        )

        if (!Chunk.isEmpty(selection.unknownFiles)) {
          return yield* Effect.fail(
            new CommandParseError({
              input: "/reject " + mutationId,
              reason:
                "Unknown file(s) for pending mutation: " +
                Chunk.toReadonlyArray(selection.unknownFiles).join(", "),
            }),
          )
        }

        if (Chunk.isEmpty(selection.remainingTargets)) {
          yield* pending.remove(mutationId)
        } else {
          yield* pending.put(
            mutationId,
            selection.remainingTargets,
            selection.remainingPreviews,
          )
        }

        const rejectedFiles = Chunk.map(
          selection.selectedTargets,
          (target) => target.file,
        )
        const remainingFiles = Chunk.map(
          selection.remainingTargets,
          (target) => target.file,
        )

        return {
          output: formatRejectedFiles(
            mutationId,
            rejectedFiles,
            remainingFiles,
          ),
        }
      }),
  }
}

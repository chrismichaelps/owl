/** @Owl.Editor.Pending - Pending Mutation approval queue */
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Order,
  Ref,
} from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import type { Option } from "effect"
import type { PipelineMutationResult } from "../pipeline/index.js"
import type { TLITarget } from "../tli/index.js"

/** @Owl.Editor.Pending.Mutation - Mutation waiting for approval */
export interface PendingMutation {
  readonly mutationId: string
  readonly targets: Chunk.Chunk<TLITarget>
  readonly previews: Chunk.Chunk<PipelineMutationResult>
  readonly createdAt: string
}

/** @Owl.Editor.Pending.Service - Store previewed mutations for /apply */
export interface PendingMutationStoreService {
  readonly put: (
    mutationId: string,
    targets: readonly TLITarget[],
    previews?: readonly PipelineMutationResult[],
  ) => Effect.Effect<PendingMutation>
  readonly get: (
    mutationId: string,
  ) => Effect.Effect<Option.Option<PendingMutation>>
  readonly remove: (mutationId: string) => Effect.Effect<void>
  readonly list: () => Effect.Effect<Chunk.Chunk<PendingMutation>>
}

export class PendingMutationStore extends Context.Tag("PendingMutationStore")<
  PendingMutationStore,
  PendingMutationStoreService
>() {}

/** @Owl.Editor.Pending.Live - Ref-backed pending Mutation registry */
export const PendingMutationStoreLive = Layer.effect(
  PendingMutationStore,
  Effect.gen(function* () {
    const ref = yield* Ref.make<HashMap.HashMap<string, PendingMutation>>(
      HashMap.empty(),
    )

    const put = (
      mutationId: string,
      targets: readonly TLITarget[],
      previews: readonly PipelineMutationResult[] = [],
    ): Effect.Effect<PendingMutation> =>
      Effect.gen(function* () {
        const mutation = Data.struct({
          mutationId,
          targets: Chunk.fromIterable(targets),
          previews: Chunk.fromIterable(previews),
          createdAt: new Date().toISOString(),
        })

        yield* Ref.update(ref, (current) => {
          const next = HashMap.set(current, mutationId, mutation)
          const entries = Chunk.fromIterable(HashMap.entries(next))
          if (Chunk.size(entries) <= COMMAND_CONSTANTS.PENDING_MUTATION_LIMIT) {
            return next
          }

          const sorted = Chunk.sortWith(
            entries,
            ([, value]) => value.createdAt,
            Order.string,
          )
          const bounded = Chunk.drop(
            sorted,
            Chunk.size(sorted) - COMMAND_CONSTANTS.PENDING_MUTATION_LIMIT,
          )
          return HashMap.fromIterable(Chunk.toReadonlyArray(bounded))
        })

        return mutation
      })

    const get = (
      mutationId: string,
    ): Effect.Effect<Option.Option<PendingMutation>> =>
      Ref.get(ref).pipe(
        Effect.map((current) => HashMap.get(current, mutationId)),
      )

    const remove = (mutationId: string): Effect.Effect<void> =>
      Ref.update(ref, (current) => HashMap.remove(current, mutationId))

    const list = (): Effect.Effect<Chunk.Chunk<PendingMutation>> =>
      Ref.get(ref).pipe(
        Effect.map((current) =>
          Chunk.sortWith(
            Chunk.fromIterable(HashMap.values(current)),
            (entry) => entry.createdAt,
            Order.string,
          ),
        ),
      )

    return { put, get, remove, list } satisfies PendingMutationStoreService
  }),
)

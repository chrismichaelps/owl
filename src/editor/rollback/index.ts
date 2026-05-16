/**
 * @Owl.Editor.Rollback - Atomic file restoration: register pre-mutation state, restore on failure
 *
 * The Rollback System is the safety net for the Mutation Pipeline. It ensures that
 * failed mutations can be fully reversed without leaving the codebase in a broken state.
 *
 * Design:
 * - **register()**: Before each write, snapshot the original file content
 * - **rollback()**: Restore ALL files in the mutation to their pre-state
 * - **clear()**: Explicitly discard rollback entries when undo is no longer needed
 *
 * Atomicity guarantee: If ANY target in a mutation fails, ALL previous targets
 * in that mutation are restored. This prevents partial mutations.
 *
 * @example
 * // Before writing changes
 * yield* Effect.flatMap(RollbackSystem, (r) =>
 *   r.register("mutation-1", "src/foo.ts", originalContent)
 * )
 *
 * // If write fails
 * yield* Effect.flatMap(RollbackSystem, (r) =>
 *   r.rollback("mutation-1", projectRoot)
 * )
 * // All files in "mutation-1" are restored to registered content
 */
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Option,
  Ref,
} from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { RollbackError } from "../../core/errors/index.js"
import { resolveProjectPath } from "../../core/path/index.js"

/** @Owl.Editor.Rollback.Entry - Immutable snapshot of a file */
export type RollbackEntry = Readonly<{
  readonly mutationId: string
  readonly file: string
  readonly originalContent: string
  readonly timestamp: string
}>

const makeRollbackEntry = (
  mutationId: string,
  file: string,
  originalContent: string,
): RollbackEntry =>
  Data.struct({
    mutationId,
    file,
    originalContent,
    timestamp: new Date().toISOString(),
  })

/**
 * @Owl.Editor.Rollback.Service - Per-mutation file snapshot registry with atomic restore
 */
export interface RollbackSystemService {
  /**
   * Register a file's pre-mutation content
   *
   * Called before TLI write. Multiple files can be registered for the same mutationId.
   *
   * @param mutationId - Unique mutation identifier
   * @param file - Relative file path
   * @param originalContent - Exact content before mutation
   */
  readonly register: (
    mutationId: string,
    file: string,
    originalContent: string,
  ) => Effect.Effect<void>
  /**
   * Restore ALL files registered for this mutation to their pre-mutation state
   *
   * @param mutationId - Mutation to roll back
   * @param projectRoot - Project root for resolving paths
   * @returns Array of restored file paths
   * @throws RollbackError - No entries found for mutationId
   */
  readonly rollback: (
    mutationId: string,
    projectRoot: string,
  ) => Effect.Effect<readonly string[], RollbackError>
  /**
   * Get all rollback entries for a mutation (for /diff command)
   *
   * @param mutationId - Mutation to query
   * @returns Array of RollbackEntry with timestamps
   */
  readonly getEntries: (
    mutationId: string,
  ) => Effect.Effect<readonly RollbackEntry[]>
  /**
   * Clear rollback entries explicitly
   *
   * @param mutationId - Mutation to clear
   */
  readonly clear: (mutationId: string) => Effect.Effect<void>
}

export class RollbackSystem extends Context.Tag("RollbackSystem")<
  RollbackSystem,
  RollbackSystemService
>() {}

/**
 * @Owl.Editor.Rollback.Live - HashMap-backed store; writes via NodeFileSystem on restore
 *
 * Maintains HashMap<mutationId, Chunk<RollbackEntry>> in memory. On rollback,
 * reads entries and writes originalContent back to disk. Entries clear only after
 * rollback or explicit cleanup, so successful mutations remain undoable.
 */
export const RollbackSystemLive = Layer.effect(
  RollbackSystem,
  Effect.gen(function* () {
    const storeRef = yield* Ref.make<
      HashMap.HashMap<string, Chunk.Chunk<RollbackEntry>>
    >(HashMap.empty())
    const fs = yield* FileSystem.FileSystem

    const register = (
      mutationId: string,
      file: string,
      originalContent: string,
    ): Effect.Effect<void> =>
      Ref.update(storeRef, (store) => {
        const existing = Option.getOrElse(HashMap.get(store, mutationId), () =>
          Chunk.empty<RollbackEntry>(),
        )
        return HashMap.set(
          store,
          mutationId,
          Chunk.append(
            existing,
            makeRollbackEntry(mutationId, file, originalContent),
          ),
        )
      })

    const rollback = (
      mutationId: string,
      projectRoot: string,
    ): Effect.Effect<readonly string[], RollbackError> =>
      Effect.gen(function* () {
        const store = yield* Ref.get(storeRef)
        const entries = Option.getOrElse(HashMap.get(store, mutationId), () =>
          Chunk.empty<RollbackEntry>(),
        )

        if (Chunk.isEmpty(entries)) {
          return yield* Effect.fail(
            new RollbackError({
              files: [],
              reason: `No rollback entries registered for mutation "${mutationId}"`,
            }),
          )
        }

        let restored = Chunk.empty<string>()
        for (const entry of entries) {
          const fullPath = yield* resolveProjectPath(
            projectRoot,
            entry.file,
            "rollback",
          ).pipe(
            Effect.mapError(
              () =>
                new RollbackError({
                  files: [entry.file],
                  reason: `Refused to restore ${entry.file} outside project root`,
                }),
            ),
          )
          yield* fs.writeFileString(fullPath, entry.originalContent).pipe(
            Effect.mapError(
              () =>
                new RollbackError({
                  files: [entry.file],
                  reason: `Failed to restore ${entry.file} — file system error`,
                }),
            ),
          )
          restored = Chunk.append(restored, entry.file)
        }

        yield* Ref.update(storeRef, (s) => HashMap.remove(s, mutationId))

        return Chunk.toReadonlyArray(restored)
      })

    const getEntries = (
      mutationId: string,
    ): Effect.Effect<readonly RollbackEntry[]> =>
      Ref.get(storeRef).pipe(
        Effect.map((store) =>
          Chunk.toReadonlyArray(
            Option.getOrElse(HashMap.get(store, mutationId), () =>
              Chunk.empty<RollbackEntry>(),
            ),
          ),
        ),
      )

    const clear = (mutationId: string): Effect.Effect<void> =>
      Ref.update(storeRef, (store) => HashMap.remove(store, mutationId))

    return {
      register,
      rollback,
      getEntries,
      clear,
    } satisfies RollbackSystemService
  }),
).pipe(Layer.provide(NodeFileSystem.layer))

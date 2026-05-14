/**
 * @Owl.Editor.Rollback - Atomic file restoration: register pre-mutation state, restore on failure
 *
 * The Rollback System is the safety net for the Mutation Pipeline. It ensures that
 * failed mutations can be fully reversed without leaving the codebase in a broken state.
 *
 * Design:
 * - **register()**: Before each write, snapshot the original file content
 * - **rollback()**: On any failure, restore ALL files in the mutation to their pre-state
 * - **clear()**: After successful completion, discard rollback entries
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
import { Context, Effect, Layer, Ref } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { RollbackError } from "../../core/errors/index.js"
import path from "node:path"

/**
 * @Owl.Editor.Rollback.Entry - Immutable snapshot of a file before mutation
 */
export interface RollbackEntry {
  readonly mutationId: string
  readonly file: string
  readonly originalContent: string
  readonly timestamp: string
}

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
   * Clear rollback entries after successful mutation
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
 * @Owl.Editor.Rollback.Live - Ref<Map>-backed store; writes via NodeFileSystem on restore
 *
 * Maintains Map<mutationId, RollbackEntry[]> in memory. On rollback, reads entries
 * and writes originalContent back to disk. Entries cleared after successful rollback.
 */
export const RollbackSystemLive = Layer.effect(
  RollbackSystem,
  Effect.gen(function* () {
    const storeRef = yield* Ref.make<Map<string, RollbackEntry[]>>(new Map())
    const fs = yield* FileSystem.FileSystem

    const register = (
      mutationId: string,
      file: string,
      originalContent: string,
    ): Effect.Effect<void> =>
      Ref.update(storeRef, (store) => {
        const next = new Map(store)
        const existing = next.get(mutationId) ?? []
        next.set(mutationId, [
          ...existing,
          {
            mutationId,
            file,
            originalContent,
            timestamp: new Date().toISOString(),
          },
        ])
        return next
      })

    const rollback = (
      mutationId: string,
      projectRoot: string,
    ): Effect.Effect<readonly string[], RollbackError> =>
      Effect.gen(function* () {
        const store = yield* Ref.get(storeRef)
        const entries = store.get(mutationId) ?? []

        if (entries.length === 0) {
          return yield* Effect.fail(
            new RollbackError({
              files: [],
              reason: `No rollback entries registered for mutation "${mutationId}"`,
            }),
          )
        }

        const restored: string[] = []
        for (const entry of entries) {
          const fullPath = path.join(projectRoot, entry.file)
          yield* fs.writeFileString(fullPath, entry.originalContent).pipe(
            Effect.mapError(
              () =>
                new RollbackError({
                  files: [entry.file],
                  reason: `Failed to restore ${entry.file} — file system error`,
                }),
            ),
          )
          restored.push(entry.file)
        }

        yield* Ref.update(storeRef, (s) => {
          const next = new Map(s)
          next.delete(mutationId)
          return next
        })

        return restored
      })

    const getEntries = (
      mutationId: string,
    ): Effect.Effect<readonly RollbackEntry[]> =>
      Ref.get(storeRef).pipe(Effect.map((store) => store.get(mutationId) ?? []))

    const clear = (mutationId: string): Effect.Effect<void> =>
      Ref.update(storeRef, (store) => {
        const next = new Map(store)
        next.delete(mutationId)
        return next
      })

    return {
      register,
      rollback,
      getEntries,
      clear,
    } satisfies RollbackSystemService
  }),
).pipe(Layer.provide(NodeFileSystem.layer))

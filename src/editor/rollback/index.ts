/** @Owl.Editor.Rollback - Atomic file restoration: register pre-mutation state, restore on failure */
import { Context, Effect, Layer, Ref } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { RollbackError } from "../../core/errors/index.js"
import path from "node:path"

/** @Owl.Editor.Rollback.Entry - Immutable snapshot of a file before mutation */
export interface RollbackEntry {
  readonly mutationId: string
  readonly file: string
  readonly originalContent: string
  readonly timestamp: string
}

/** @Owl.Editor.Rollback.Service - Per-mutation file snapshot registry with atomic restore */
export interface RollbackSystemService {
  readonly register: (
    mutationId: string,
    file: string,
    originalContent: string,
  ) => Effect.Effect<void>
  readonly rollback: (
    mutationId: string,
    projectRoot: string,
  ) => Effect.Effect<readonly string[], RollbackError>
  readonly getEntries: (
    mutationId: string,
  ) => Effect.Effect<readonly RollbackEntry[]>
  readonly clear: (mutationId: string) => Effect.Effect<void>
}

export class RollbackSystem extends Context.Tag("RollbackSystem")<
  RollbackSystem,
  RollbackSystemService
>() {}

/** @Owl.Editor.Rollback.Live - Ref<Map>-backed store; writes via NodeFileSystem on restore */
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
      Ref.get(storeRef).pipe(
        Effect.map((store) => store.get(mutationId) ?? []),
      )

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

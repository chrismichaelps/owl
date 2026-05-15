/**
 * @Owl.Tokens.Cache - Trust-scored ContextCache summaries
 *
 * Stores reusable ContextCache summaries so Owl can avoid repeated context
 * reconstruction. The in-memory layer is deterministic for tests and short
 * sessions. The persistent layer writes the same bounded state to disk.
 */
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import path from "node:path"
import { CachePersistenceError } from "../../core/errors/index.js"
import { Context, Effect, Layer, Option, Ref } from "effect"
import {
  boundStore,
  decodeCacheEntry,
  decodePersistedState,
  toPersistedState,
  type CacheFailure,
  type CacheStore,
  type PersistSnapshot,
} from "./persistence.js"
export {
  CacheEntrySchema,
  PersistedCacheStateSchema,
  type CacheEntry,
  type PersistedCacheState,
} from "./schema.js"
import type { CacheValidationError } from "../../core/errors/index.js"
import type { CacheEntry } from "./schema.js"

/** @Owl.Tokens.Cache.Service - Effect service interface */
export interface ContextCacheService {
  readonly store: (
    key: string,
    entry: CacheEntry,
  ) => Effect.Effect<void, CacheFailure>
  readonly get: (key: string) => Effect.Effect<Option.Option<CacheEntry>>
  readonly invalidate: (key: string) => Effect.Effect<void, CacheFailure>
  readonly invalidateAll: () => Effect.Effect<void, CacheFailure>
  readonly totalSavedTokens: () => Effect.Effect<number>
}

export class ContextCache extends Context.Tag("ContextCache")<
  ContextCache,
  ContextCacheService
>() {}

const makeService = (
  storeRef: Ref.Ref<CacheStore>,
  persist: PersistSnapshot,
): ContextCacheService => {
  const persistCurrent = (): Effect.Effect<void, CacheFailure> =>
    Ref.get(storeRef).pipe(Effect.flatMap(persist))

  const store = (
    key: string,
    entry: CacheEntry,
  ): Effect.Effect<void, CacheFailure> =>
    Effect.gen(function* () {
      const decoded = yield* decodeCacheEntry(key, entry)
      yield* Ref.update(storeRef, (current) => {
        const next = new Map(current)
        next.set(key, decoded)
        return boundStore(next)
      })
      yield* persistCurrent()
    })

  const get = (key: string): Effect.Effect<Option.Option<CacheEntry>> =>
    Ref.get(storeRef).pipe(
      Effect.map((current) => {
        const entry = current.get(key)
        return entry === undefined ? Option.none() : Option.some(entry)
      }),
    )

  const invalidate = (key: string): Effect.Effect<void, CacheFailure> =>
    Ref.update(storeRef, (current) => {
      const next = new Map(current)
      next.delete(key)
      return next
    }).pipe(Effect.zipRight(persistCurrent()))

  const invalidateAll = (): Effect.Effect<void, CacheFailure> =>
    Ref.set(storeRef, new Map()).pipe(Effect.zipRight(persistCurrent()))

  const totalSavedTokens = (): Effect.Effect<number> =>
    Ref.get(storeRef).pipe(
      Effect.map((current) =>
        Array.from(current.values()).reduce(
          (sum, entry) => sum + entry.tokenCount,
          0,
        ),
      ),
    )

  return {
    store,
    get,
    invalidate,
    invalidateAll,
    totalSavedTokens,
  }
}

const noPersist: PersistSnapshot = () => Effect.void

/** @Owl.Tokens.Cache.Live - Ref-backed in-memory ContextCache */
export const ContextCacheLive = Layer.effect(
  ContextCache,
  Effect.gen(function* () {
    const storeRef = yield* Ref.make<CacheStore>(new Map())
    return makeService(storeRef, noPersist)
  }),
)

/** @Owl.Tokens.Cache.Persistent - File-backed ContextCache layer */
export const makePersistentContextCacheLive = (
  storagePath: string,
): Layer.Layer<ContextCache, CachePersistenceError | CacheValidationError> =>
  Layer.effect(
    ContextCache,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const exists = yield* fs.exists(storagePath).pipe(
        Effect.mapError(
          () =>
            new CachePersistenceError({
              path: storagePath,
              reason: "Unable to inspect ContextCache storage path",
            }),
        ),
      )

      const initialStore = exists
        ? yield* fs.readFileString(storagePath).pipe(
            Effect.mapError(
              () =>
                new CachePersistenceError({
                  path: storagePath,
                  reason: "Unable to read ContextCache storage",
                }),
            ),
            Effect.flatMap((raw) => decodePersistedState(storagePath, raw)),
            Effect.map((state) =>
              boundStore(
                new Map(
                  state.entries.map((record) => [record.key, record.entry]),
                ),
              ),
            ),
          )
        : new Map<string, CacheEntry>()

      const storeRef = yield* Ref.make<CacheStore>(initialStore)
      const persist: PersistSnapshot = (store) =>
        fs
          .makeDirectory(path.dirname(storagePath), { recursive: true })
          .pipe(
            Effect.mapError(
              () =>
                new CachePersistenceError({
                  path: storagePath,
                  reason: "Unable to create ContextCache storage directory",
                }),
            ),
            Effect.zipRight(
              fs.writeFileString(
                storagePath,
                JSON.stringify(toPersistedState(store), null, 2),
              ),
            ),
            Effect.mapError(
              () =>
                new CachePersistenceError({
                  path: storagePath,
                  reason: "Unable to write ContextCache storage",
                }),
            ),
          )

      return makeService(storeRef, persist)
    }),
  ).pipe(Layer.provide(NodeFileSystem.layer))

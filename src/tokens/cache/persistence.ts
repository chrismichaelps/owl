/**
 * @Owl.Tokens.Cache.Persistence - ContextCache validation and persistence helpers
 */
import { Chunk, Data, Effect, HashMap, Schema } from "effect"
import { CACHE_CONSTANTS } from "../../core/constants/index.js"
import {
  CachePersistenceError,
  CacheValidationError,
} from "../../core/errors/index.js"
import {
  CacheEntrySchema,
  PersistedCacheStateSchema,
  type CacheEntry,
  type PersistedCacheState,
} from "./schema.js"

export type CacheFailure = CacheValidationError | CachePersistenceError
export type CacheStore = HashMap.HashMap<string, CacheEntry>
export type PersistSnapshot = (
  store: CacheStore,
) => Effect.Effect<void, CacheFailure>
type CacheStoreEntry = readonly [string, CacheEntry]

const compareCacheStoreEntries = (
  [, left]: CacheStoreEntry,
  [, right]: CacheStoreEntry,
): -1 | 0 | 1 => {
  const delta = (right.createdAt ?? 0) - (left.createdAt ?? 0)
  if (delta < 0) return -1
  if (delta > 0) return 1
  return 0
}

export const decodeCacheEntry = (
  key: string,
  entry: CacheEntry,
): Effect.Effect<CacheEntry, CacheValidationError> =>
  Effect.try({
    try: () => Schema.decodeUnknownSync(CacheEntrySchema)(entry),
    catch: (error) =>
      new CacheValidationError({
        key,
        reason: String(error),
      }),
  }).pipe(
    Effect.flatMap((decoded) => {
      if (decoded.tokenCount < 0) {
        return Effect.fail(
          new CacheValidationError({
            key,
            reason: "tokenCount must be greater than or equal to 0",
          }),
        )
      }
      if (
        decoded.trustScore < CACHE_CONSTANTS.MIN_TRUST_SCORE ||
        decoded.trustScore > CACHE_CONSTANTS.MAX_TRUST_SCORE
      ) {
        return Effect.fail(
          new CacheValidationError({
            key,
            reason:
              "trustScore must be between " +
              String(CACHE_CONSTANTS.MIN_TRUST_SCORE) +
              " and " +
              String(CACHE_CONSTANTS.MAX_TRUST_SCORE),
          }),
        )
      }
      return Effect.succeed(
        Data.struct({
          ...decoded,
          createdAt: decoded.createdAt ?? Date.now(),
        }),
      )
    }),
  )

export const boundStore = (store: CacheStore): CacheStore => {
  const allEntries = Chunk.map(
    Chunk.fromIterable(HashMap.entries(store)),
    ([key, entry]): CacheStoreEntry => [key, entry],
  )
  const entries = Chunk.take(
    Chunk.sort(allEntries, compareCacheStoreEntries),
    CACHE_CONSTANTS.MAX_ENTRIES,
  )
  return HashMap.fromIterable(entries)
}

export const toPersistedState = (store: CacheStore): PersistedCacheState => ({
  version: CACHE_CONSTANTS.PERSISTENCE_SCHEMA_VERSION,
  entries: Chunk.toReadonlyArray(
    Chunk.map(Chunk.fromIterable(HashMap.entries(store)), ([key, entry]) =>
      Data.struct({ key, entry }),
    ),
  ),
})

export const decodePersistedState = (
  storagePath: string,
  raw: string,
): Effect.Effect<PersistedCacheState, CachePersistenceError> =>
  Effect.try({
    try: () =>
      Schema.decodeUnknownSync(PersistedCacheStateSchema)(JSON.parse(raw)),
    catch: (error) =>
      new CachePersistenceError({
        path: storagePath,
        reason: String(error),
      }),
  })

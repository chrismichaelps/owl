/**
 * @Owl.Tokens.Cache.Persistence - ContextCache validation and persistence helpers
 */
import { Effect, Schema } from "effect"
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
export type CacheStore = Map<string, CacheEntry>
export type PersistSnapshot = (
  store: CacheStore,
) => Effect.Effect<void, CacheFailure>

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
      return Effect.succeed({
        ...decoded,
        createdAt: decoded.createdAt ?? Date.now(),
      })
    }),
  )

export const boundStore = (store: CacheStore): CacheStore => {
  const entries = Array.from(store.entries())
    .sort(
      ([, left], [, right]) => (right.createdAt ?? 0) - (left.createdAt ?? 0),
    )
    .slice(0, CACHE_CONSTANTS.MAX_ENTRIES)
  return new Map(entries)
}

export const toPersistedState = (store: CacheStore): PersistedCacheState => ({
  version: CACHE_CONSTANTS.PERSISTENCE_SCHEMA_VERSION,
  entries: Array.from(store.entries()).map(([key, entry]) => ({ key, entry })),
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

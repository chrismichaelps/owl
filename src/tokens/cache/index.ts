/**
 * @Owl.Tokens.Cache - Trust-scored context cache for reusable summaries
 *
 * Caches conversation summaries to avoid recomputing context.
 * Each cache entry has a trust score indicating reliability.
 *
 * Used for:
 * - /memory: Display cached session summaries
 * - Token savings: Reuse summaries instead of full context
 *
 * @example
 * yield* Effect.flatMap(ContextCache, (c) =>
 *   c.store("session-1", { summary: "...", tokenCount: 500, trustScore: 0.9 })
 * )
 * const entry = yield* Effect.flatMap(ContextCache, (c) => c.get("session-1"))
 */
import { Context, Effect, Layer, Option, Ref } from "effect"

/**
 * @Owl.Tokens.Cache.Entry - Immutable cached summary with trust metadata
 */
export interface CacheEntry {
  readonly summary: string
  readonly tokenCount: number
  readonly trustScore: number
  readonly createdAt?: number
}

/**
 * @Owl.Tokens.Cache.Service - Effect service interface
 */
export interface ContextCacheService {
  /**
   * Store a cache entry
   *
   * @param key - Cache key (e.g., session ID)
   * @param entry - Cache entry with summary and metadata
   */
  readonly store: (key: string, entry: CacheEntry) => Effect.Effect<void>
  /**
   * Retrieve a cache entry
   *
   * @param key - Cache key
   * @returns Option<CacheEntry> (Some if exists, None if not)
   */
  readonly get: (key: string) => Effect.Effect<Option.Option<CacheEntry>>
  /**
   * Invalidate a single entry
   */
  readonly invalidate: (key: string) => Effect.Effect<void>
  /**
   * Clear all entries
   */
  readonly invalidateAll: () => Effect.Effect<void>
  /**
   * Get total tokens saved by cache
   */
  readonly totalSavedTokens: () => Effect.Effect<number>
}

export class ContextCache extends Context.Tag("ContextCache")<
  ContextCache,
  ContextCacheService
>() {}

/**
 * @Owl.Tokens.Cache.Live - Ref-backed in-memory cache implementation
 */
export const ContextCacheLive = Layer.effect(
  ContextCache,
  Effect.gen(function* () {
    const storeRef = yield* Ref.make<Map<string, CacheEntry>>(new Map())

    const store = (key: string, entry: CacheEntry): Effect.Effect<void> =>
      Ref.update(storeRef, (m) => {
        const next = new Map(m)
        next.set(key, { ...entry, createdAt: Date.now() })
        return next
      })

    const get = (key: string): Effect.Effect<Option.Option<CacheEntry>> =>
      Ref.get(storeRef).pipe(
        Effect.map((m) => {
          const entry = m.get(key)
          return entry !== undefined ? Option.some(entry) : Option.none()
        }),
      )

    const invalidate = (key: string): Effect.Effect<void> =>
      Ref.update(storeRef, (m) => {
        const next = new Map(m)
        next.delete(key)
        return next
      })

    const invalidateAll = (): Effect.Effect<void> =>
      Ref.set(storeRef, new Map())

    const totalSavedTokens = (): Effect.Effect<number> =>
      Ref.get(storeRef).pipe(
        Effect.map((m) =>
          Array.from(m.values()).reduce((sum, e) => sum + e.tokenCount, 0),
        ),
      )

    return {
      store,
      get,
      invalidate,
      invalidateAll,
      totalSavedTokens,
    } satisfies ContextCacheService
  }),
)

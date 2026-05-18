State_ID: BigInt(0x797f8334b3d11a02)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 797f8334b3d11a02a5574e595592ecf736ed87edc5f8a73433dfade1c8307538
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Tokens.Cache (src/tokens/cache/index.ts)

### [Signatures]
- `ContextCache: Context.Tag<ContextCache, ContextCacheService>`
- `ContextCacheLive: Layer.effect<ContextCache, ContextCacheService>`
- `makePersistentContextCacheLive(storagePath: string) => Layer<ContextCache>`
- Re-exports `CacheEntrySchema`, `PersistedCacheStateSchema`, `CacheEntry`, `PersistedCacheState`
- `store(key: string, entry: CacheEntry) => Effect<void>`
- `get(key: string) => Effect<Option<CacheEntry>>`
- `invalidate(key: string) => Effect<void>`
- `invalidateAll() => Effect<void>`
- `totalSavedTokens() => Effect<number>`

### [Governance]
- depth_score: 0.78 — DEEP (schema-first bounded cache with optional persistence)
- seam_capacity: INTERNAL
- leverage: MEDIUM (trust-scored context cache)
- SIG_ID: SIG-tokens-cache-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tokens/pruning/index.hash.md`
- Children: `@root/hashes/src/tokens/cache/schema.hash.md`, `@root/hashes/src/tokens/cache/persistence.hash.md`

### [Architecture]
- Trust-scored ContextCache for reusable summaries.
- Delegates schema contracts to cache/schema and validation/persistence helpers to cache/persistence.
- In-memory implementation with Effect Ref backing.
- Optional persistent implementation writes bounded state to disk.
- Tracks total saved Tokens across retained entries.

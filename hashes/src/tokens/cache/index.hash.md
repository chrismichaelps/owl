State_ID: BigInt(0x0000000000000078)
Git_SHA: 9e5c31596b36f990f88d402b533fcfc1104cbe87
Source_SHA256: 82105a049f1761aab6a678005b5faa777129ef789d9fb8329b3ec58f8150745f
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

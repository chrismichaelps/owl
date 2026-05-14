State_ID: BigInt(0x000000000000001E)
Git_SHA: fb368e4bc5841a3737fa5acba3fc6a127e9f0bec
Source_SHA256: de55e38cf2748c5ef7451c1feba74bef562c5338be9acb5bfa95749defd87bf2
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Tokens.Cache (src/tokens/cache/index.ts)

### [Signatures]
- `ContextCache: Context.Tag<ContextCache, ContextCacheService>`
- `ContextCacheLive: Layer.effect<ContextCache, ContextCacheService>`
- `store(key: string, entry: CacheEntry) => Effect<void>`
- `get(key: string) => Effect<Option<CacheEntry>>`
- `invalidate(key: string) => Effect<void>`
- `invalidateAll() => Effect<void>`
- `totalSavedTokens() => Effect<number>`

### [Governance]
- depth_score: 0.65 — MEDIUM (simple in-memory cache)
- seam_capacity: INTERNAL
- leverage: MEDIUM (trust-scored context cache)
- SIG_ID: SIG-tokens-cache-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tokens/pruning/index.hash.md`

### [Architecture]
- Trust-scored context cache for reusable summaries
- In-memory implementation with Effect Ref backing
- CacheEntry: summary, tokenCount, trustScore, createdAt
- Provides Option-based retrieval (some/none)
- Tracks total saved tokens across all entries

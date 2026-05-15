State_ID: BigInt(0x000000000000007A)
Git_SHA: 9e5c31596b36f990f88d402b533fcfc1104cbe87
Source_SHA256: b204e7f9cc55a1fb20857393165b5bc82594d52887e637f3190e8875fd97dbe1
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Tokens.Cache.Persistence (src/tokens/cache/persistence.ts)

### [Signatures]
- `CacheFailure`
- `CacheStore`
- `PersistSnapshot`
- `decodeCacheEntry(key, entry) => Effect<CacheEntry, CacheValidationError>`
- `boundStore(store) => CacheStore`
- `toPersistedState(store) => PersistedCacheState`
- `decodePersistedState(storagePath, raw) => Effect<PersistedCacheState, CachePersistenceError>`

### [Governance]
- depth_score: 0.80 — DEEP (validation and persistence transformations behind small helpers)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-tokens-cache-persistence-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tokens/cache/index.hash.md`
- Deps: `@root/hashes/src/tokens/cache/schema.hash.md`, `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Owns ContextCache validation, retention bounding, and persisted state transforms.
- Converts schema and invariant failures into tagged cache errors.

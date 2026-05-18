State_ID: BigInt(0x3aaeb9482edf124e)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 3aaeb9482edf124e516d5987946d2548edce66a5db1dbca3b2401342b6674d6d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

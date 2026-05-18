State_ID: BigInt(0x87b70e92d149ec60)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 87b70e92d149ec6011a10401e328b903ca4a0699ecea4f6d2145e5414975667c
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Tokens.Cache.Schema (src/tokens/cache/schema.ts)

### [Signatures]
- `CacheEntrySchema`
- `CacheEntry`
- `PersistedCacheStateSchema`
- `PersistedCacheState`

### [Governance]
- depth_score: 0.72 — DEEP (small schema Interface guarding cache boundaries)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-tokens-cache-schema-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tokens/cache/index.hash.md`

### [Architecture]
- Owns Effect Schema contracts for ContextCache runtime and persisted payloads.
- Keeps schema definitions separate from cache service orchestration.

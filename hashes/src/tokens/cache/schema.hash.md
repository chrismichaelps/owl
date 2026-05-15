State_ID: BigInt(0x0000000000000079)
Git_SHA: 9e5c31596b36f990f88d402b533fcfc1104cbe87
Source_SHA256: 87b70e92d149ec6011a10401e328b903ca4a0699ecea4f6d2145e5414975667c
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

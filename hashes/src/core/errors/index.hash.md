State_ID: BigInt(0x5327ab14758e3395)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 5327ab14758e339535b421b334b8b8b0d410cc1eed730be46a8e1c71ba9cb0ff
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Core.Errors (src/core/errors/index.ts)

### [Signatures]
- `ProviderError`, `ProviderTimeoutError`, `ProviderAuthError` — provider failure hierarchy
- `ProviderRateLimitError`, `ProviderUnavailableError`, `ProviderStreamError`
- `TokenBudgetExceededError`, `TokenCountError`
- `CacheValidationError`, `CachePersistenceError`
- `GovernanceViolationError`, `HashRegistryError`, `GrammarDriftError`, `SeamTestGateError`
- `MutationError`, `RollbackError`, `TLIError`, `DiffGenerationError`
- `CommandParseError`, `CommandNotFoundError`
- `RegistryError`, `ConfigError`
- `OrchestratorError`, `ContextOverflowError`

### [Governance]
- depth_score: 0.82 — DEEP (large impl behind simple constructors)
- seam_capacity: INTERNAL
- leverage: HIGH (used by all other subsystems)
- SIG_ID: SIG-core-errors-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`

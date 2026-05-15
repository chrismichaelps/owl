State_ID: BigInt(0x0000000000000077)
Git_SHA: 9e5c31596b36f990f88d402b533fcfc1104cbe87
Source_SHA256: a3e65ec68c5690c188562eb5847fe1339d38e8ce5fb7e1c486e1816dbbb08e07
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

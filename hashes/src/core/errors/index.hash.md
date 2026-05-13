---
State_ID: BigInt(0x0000000000000028)
Git_SHA: fa98d110fe8b60149f9bf130b0ca3e06766d0e11
Source_SHA256: 580b581224c1569cbf0dc821bfebeb0eb1992e567c2dbde48c274995d110648a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Core.Errors (src/core/errors/index.ts)

### [Signatures]
- `ProviderError`, `ProviderTimeoutError`, `ProviderAuthError` — provider failure hierarchy
- `ProviderRateLimitError`, `ProviderUnavailableError`, `ProviderStreamError`
- `TokenBudgetExceededError`, `TokenCountError`
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

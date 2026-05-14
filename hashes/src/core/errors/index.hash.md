State_ID: BigInt(0x0000000000000028)
Git_SHA: fa98d110fe8b60149f9bf130b0ca3e06766d0e11
Source_SHA256: 193f6990816141e2aa3088f66a94452705b01715d102913c8b10acb6e4eff961
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

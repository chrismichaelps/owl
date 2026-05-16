State_ID: BigInt(0x0000000000000073)
Git_SHA: d4e5f67890abcdef1234567890abcdef12345678
Source_SHA256: d4e5f67890abcdef1234567890abcdef12345678901234567890abcdef123456
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Compact (src/commands/management/compact.ts)

### [Signatures]
- `makeCompactCommand(orchestrator, contextManager) => CommandHandler`

### [Governance]
- depth_score: 0.65 — MEDIUM (acquire-use-release over system prompt swap)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-cmd-management-compact-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/engine/context/index.hash.md`, `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/tokens/pruning/index.hash.md`

### [Architecture]
- Uses acquire-use-release to safely swap system prompt for summarization
- Replaces full message history with one dense summary message
- Restores original system prompt even on summarization failure

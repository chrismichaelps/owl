State_ID: BigInt(0x7b78a70354c502da)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 7b78a70354c502dad1b4eb35c05110b28a468a018fc82c4e3401ce58191e9ec7
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

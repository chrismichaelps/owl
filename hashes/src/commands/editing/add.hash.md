State_ID: BigInt(0x0000000000000072)
Git_SHA: c3d4e5f67890abcdef1234567890abcdef123456
Source_SHA256: c3d4e5f67890abcdef1234567890abcdef123456789abcdef1234567890abcde
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Editing.Add (src/commands/editing/add.ts)

### [Signatures]
- `makeAddCommand(orchestrator, contextManager, ...) => CommandHandler`

### [Governance]
- depth_score: 0.60 — MEDIUM (Effect pipeline over editor + orchestrator)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-cmd-editing-add-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/commands/utils/ids.hash.md`, `@root/hashes/src/commands/utils/prompt.hash.md`, `@root/hashes/src/editor/pipeline/index.hash.md`, `@root/hashes/src/engine/orchestrator/index.hash.md`

### [Architecture]
- Validates prompt text then runs Inference for a file-add operation
- Delegates mutation pipeline to editor/pipeline
- Wraps result in CommandResult shape

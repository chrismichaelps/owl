State_ID: BigInt(0x57b34253414a8b4f)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 57b34253414a8b4f0b288da231a43c021b62d1dd05cfb12061d6661fcdbfddb4
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

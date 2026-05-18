State_ID: BigInt(0x495e24eaf323c684)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 495e24eaf323c6847b5033b63560a2f828f7464c52d87864e5fa128e96c3d1f5
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Utils.Ids (src/commands/utils/ids.ts)

### [Signatures]
- `makeCommandTaskId(commandName, prompt) => string`
- `makeMutationId(kind, file, parts) => string`

### [Governance]
- depth_score: 0.72 — DEEP (pure deterministic hash generation, hides crypto internals)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-utils-ids-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Generates stable SHA-256 derived IDs for tasks and mutations
- IDs are deterministic — same inputs always produce same ID
- Hides node:crypto behind a clean 2-function interface

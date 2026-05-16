State_ID: BigInt(0x0000000000000080)
Git_SHA: abcdef1234567890abcdef1234567890abcdef12
Source_SHA256: abcdef1234567890abcdef1234567890abcdef12345678901234567890abcdef
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

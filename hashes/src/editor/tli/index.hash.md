---
State_ID: BigInt(0x0000000000000033)
Git_SHA: 488f1c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
Source_SHA256: 057e5af613854619d9b4fb5f9938c7bf04ad21eff3cbe962e73453ee54efd29b
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Editor.TLI (src/editor/tli/index.ts)

### [Signatures]
- `TLIExecutor: Class`
- `executeTLI(file: string, patch: Patch) => Result<void, TLIError>`
- `preparePhase(file: string, patch: Patch) => Result<PreparedEdit, PrepareError>`
- `writePhase(prepared: PreparedEdit) => Result<void, WriteError>`

### [Governance]
- depth_score: 0.90 — DEEP (surgical code injection)
- seam_capacity: BACKBONE (direct code modification)
- leverage: MAXIMAL (executes all file changes)
- SIG_ID: SIG-editor-tli-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/editor/pipeline.hash.md`
- Uses: `@root/src/editor/rollback/index.js`

### [Architecture]
- Two-phase execution: Prepare (validate) → Write (persist)
- Atomic write operations with rollback on failure
- Validates grammar alignment before write
- Tracks edit provenance for traceability
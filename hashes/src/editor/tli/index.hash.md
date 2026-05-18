State_ID: BigInt(0x1b3eaf1ecd408208)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 1b3eaf1ecd408208ac7bc5f4929221b21a54401ceb5a0e472d58499ac6a67e4b
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

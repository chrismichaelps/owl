State_ID: BigInt(0x0000000000000033)
Git_SHA: b635ad0602f346f8eb07380bfb954838e91266b3
Source_SHA256: 5907e8084968c13048a0589ddce57e40191e4dbc6c4fa1b14b5565fe91b74139
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

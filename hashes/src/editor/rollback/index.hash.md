State_ID: BigInt(0x57f3f6b72a9f5faa)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 57f3f6b72a9f5faa60220ee0be8924b3148abab61b64b31db4d518dd11713127
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Editor.Rollback (src/editor/rollback/index.ts)

### [Signatures]
- `RollbackSystem: Class`
- `Snapshot: { id: string; content: string; timestamp: Date }`
- `createSnapshot(file: string) => Result<Snapshot, RollbackError>`
- `restore(snapshotId: string) => Result<void, RestoreError>`
- `getEntries(file?: string) => Snapshot[]`

### [Governance]
- depth_score: 0.86 — DEEP (atomic state restoration)
- seam_capacity: CRITICAL (provides recovery capability)
- leverage: HIGH (enables safe surgical edits)
- SIG_ID: SIG-editor-rollback-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/editor/index.hash.md`
- Used by: `@root/hashes/src/editor/tli.hash.md`

### [Architecture]
- Atomic file restoration with per-mutation snapshots
- O(1) lookup via Map-based storage
- Timestamp-based ordering for audit trail
- Supports selective restoration by file or global

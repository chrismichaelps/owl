---
State_ID: BigInt(0x0000000000000034)
Git_SHA: d386153e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d
Source_SHA256: ade186911fe24b50d13983e118c2c529c115e4c42ba0c5cfea558322c9afede2
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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
State_ID: BigInt(0x0000000000000034)
Git_SHA: d386153acc47d38c1c3f0da6b03514d9c4947e50
Source_SHA256: ce7591b7e3c1f75693f85dfbcee88d1d9aaef230d510a427eb6ad0f233f74e45
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

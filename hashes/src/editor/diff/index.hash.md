---
State_ID: BigInt(0x0000000000000031)
Git_SHA: bcdd88c9e2f1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
Source_SHA256: bb5a18c09fdb083e45521a3d87b66d9d2c84aa3f423b580ccc4793ebbe8d59aa
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Editor.Diff (src/editor/diff/index.ts)

### [Signatures]
- `DiffGenerator: Class`
- `DiffResult: { patch: Patch; shardSplit: boolean; sizeEstimate: number }`
- `generateDiff(before: string, after: string) => DiffResult`

### [Governance]
- depth_score: 0.88 — DEEP (core editor transformation)
- seam_capacity: CRITICAL (connects all editor stages)
- leverage: MAXIMAL (all editor operations flow through diff)
- SIG_ID: SIG-editor-diff-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Child: `@root/hashes/src/editor/pipeline.hash.md`
- Uses: `@root/src/editor/utils/patch.js`, `@root/src/editor/utils/strings.js`

### [Architecture]
- Generates structured patches between file states
- Detects Shard Split conditions (>15% change triggers split)
- Provides size estimation for governance checks
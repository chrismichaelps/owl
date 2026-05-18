State_ID: BigInt(0xea4a746b78f66500)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: ea4a746b78f66500b9be12446057d9189e6521dee2ce75941e3bb0691cfce1cb
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

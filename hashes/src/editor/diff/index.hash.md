State_ID: BigInt(0x0000000000000031)
Git_SHA: d3de64991c1e025b52d39baeb56b625307e8f5a4
Source_SHA256: 107de81181243dc55db63a9f16d712f5b186874961aa6d9ffddea5beb53814b6
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

State_ID: BigInt(0x3d6d26784acf2138)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 3d6d26784acf2138891ecda97b5e8b30ae8c8c3fd456ab945d58590c522e2d53
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Editor.Utils.Patch (src/editor/utils/patch.ts)

### [Signatures]
- `Patch: { before: string; after: string; hunks: Hunk[] }`
- `Hunk: { startLine: number; endLine: number; lines: string[] }`
- `applyPatch(content: string, patch: Patch): string`
- `parsePatch(raw: string): Patch`

### [Governance]
- depth_score: 0.78 — DEEP (patch manipulation)
- seam_capacity: CRITICAL (diff module dependency)
- leverage: HIGH (core patch operations)
- SIG_ID: SIG-editor-utils-patch-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/editor/utils.hash.md`
- Used by: `@root/hashes/src/editor/diff.hash.md`

### [Architecture]
- Structured patch representation with hunk-level granularity
- Apply/parse operations for patch manipulation
- Supports multi-hunk patches for complex edits

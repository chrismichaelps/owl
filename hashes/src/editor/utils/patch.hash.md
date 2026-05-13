---
State_ID: BigInt(0x0000000000000036)
Git_SHA: b635ad0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b
Source_SHA256: 6a20d1abd4eee66f99822a66a4c78473bde0fdd53c85267e9dda4e07b2645ced
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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
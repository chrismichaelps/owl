State_ID: BigInt(0x0000000000000036)
Git_SHA: b635ad0602f346f8eb07380bfb954838e91266b3
Source_SHA256: ec493a3df295d4b819220d7eb1ef2c85982c234f0c93eb98daa3795558bacc37
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

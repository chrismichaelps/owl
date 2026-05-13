---
State_ID: BigInt(0x0000000000000035)
Git_SHA: b635ad0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b
Source_SHA256: dd9e316a2a51eb4a35d1ec36e96b17d689e4a14a57818824575e1d1a93f13a33
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Editor.Utils.Strings (src/editor/utils/strings.ts)

### [Signatures]
- `truncate(str: string, maxLen: number): string`
- `indent(str: string, level: number): string`
- `lineCount(str: string): number`
- `isWhitespace(str: string): boolean`

### [Governance]
- depth_score: 0.65 — SHALLOW (pure string utilities)
- seam_capacity: INTERNAL (editor string manipulation)
- leverage: LOW (support utilities)
- SIG_ID: SIG-editor-utils-strings-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/editor/utils.hash.md`

### [Architecture]
- Lightweight string manipulation helpers
- No side-effects, pure functions
- Used by diff and patch modules
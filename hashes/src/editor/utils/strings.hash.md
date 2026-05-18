State_ID: BigInt(0xef5386649489ec1f)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: ef5386649489ec1f2eefb32ff88770bd463c805dbc8e412ab75a7e016ad1de54
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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

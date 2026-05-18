State_ID: BigInt(0x4a42b894181eba36)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4a42b894181eba3605a29781c30f9ff982b9d4e0425609175a38fb2aba394e1a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.Mentions.Files (src/tui/mentions/files.ts)

### [Signatures]
- `listProjectFiles(projectRoot: string) => Promise<readonly ProjectFile[]>`
- `filterFiles(files, query) => readonly ProjectFile[]`
- `extractAtQuery(value: string) => string | null`
- `completeAtMention(value: string, selectedPath: string) => string`

### [Governance]
- depth_score: 0.73 — DEEP (fast-glob enumeration + filtering hidden behind 4-function surface)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-tui-mentions-files-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/mentions/index.hash.md`

### [Architecture]
- Uses fast-glob for project enumeration with node_modules/.git/dist ignored
- MAX_FILES=200 cap prevents performance degradation on large repos
- filterFiles returns max 8 results for compact palette display
- extractAtQuery matches @ at end of string — live-as-you-type autocomplete

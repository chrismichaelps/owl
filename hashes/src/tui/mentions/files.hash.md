State_ID: BigInt(0x0000000000000099)
Git_SHA: d8e7f6a5b4c3d2e1
Source_SHA256: d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

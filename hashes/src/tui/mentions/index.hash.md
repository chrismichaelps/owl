State_ID: BigInt(0x000000000000009a)
Git_SHA: e7f6a5b4c3d2e1f0
Source_SHA256: e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Mentions (src/tui/mentions/index.ts)

### [Signatures]
- `expandMentions(prompt: string, projectRoot: string) => Promise<MentionExpansion>`
- `IMAGE_EXTENSIONS: HashSet<string>`
- `MentionExpansion: { expanded, files, errors }`

### [Governance]
- depth_score: 0.82 — DEEP (async multi-file expansion + image encoding hidden behind 1-function surface)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-tui-mentions-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/providers/image.hash.md`, `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Scans prompt for @path patterns and reads each file from disk
- Image files (.png/.jpg/.gif/.webp) are base64-encoded as owl:image tags
- Text files capped at 500KB each; 2MB total across all mentions
- IMAGE_EXTENSIONS exported so FileMentionPalette shares the same set
- Files not found are reported in errors — expansion never fails hard

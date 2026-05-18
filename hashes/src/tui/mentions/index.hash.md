State_ID: BigInt(0x4118cb3e20e880d6)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4118cb3e20e880d66f8f4e2859094ea748d535817353480f17ae606b2a1e99a5
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

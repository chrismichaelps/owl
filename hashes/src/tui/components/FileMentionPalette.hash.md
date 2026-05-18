State_ID: BigInt(0xd9bcac778f2a5340)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: d9bcac778f2a5340642aefbb8ff613af35e578b3ebaca27ea9289b26218d1c95
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.Components.FileMentionPalette (src/tui/components/FileMentionPalette.tsx)

### [Signatures]
- `FileMentionPalette: React.FC<{ files, selectedIndex, query }>`

### [Governance]
- depth_score: 0.58 — MEDIUM (file autocomplete popup with icon rendering)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-tui-cmp-filemention-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/tui/mentions/files.hash.md`, `@root/hashes/src/tui/mentions/index.hash.md`

### [Architecture]
- Renders a compact list of ProjectFile matches with file-type icons
- Image files tagged [img] using IMAGE_EXTENSIONS shared set from tui/mentions/index
- Returns null when files.length=0 and query.length=0 — no flicker on mount
- Shows 'No files matching @query' when query exists but no matches found

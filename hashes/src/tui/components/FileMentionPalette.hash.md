State_ID: BigInt(0x00000000000000a2)
Git_SHA: c2d3e4f5a6b7c8d9
Source_SHA256: c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

State_ID: BigInt(0x00000000000000a1)
Git_SHA: b1c2d3e4f5a6b7c8
Source_SHA256: b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.CommandPalette (src/tui/components/CommandPalette.tsx)

### [Signatures]
- `CommandPalette: React.FC<{ open, query, selectedIndex, commands }>`

### [Governance]
- depth_score: 0.60 — MEDIUM (fuzzy-ranked list with selection highlight)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-tui-cmp-cmdpalette-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/tui/commands/fuzzy.hash.md`, `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Returns null when open=false — no DOM cost when hidden
- Delegates ranking entirely to rankPaletteCommands — no scoring logic here
- Shows PALETTE_VISIBLE_COUNT results max via Chunk.take
- Selected item highlighted with cyanBright background

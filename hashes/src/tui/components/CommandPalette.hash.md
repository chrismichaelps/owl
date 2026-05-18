State_ID: BigInt(0x2bb54e7b29283481)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 2bb54e7b29283481e58408cf7bfe041e0015564d78932529e7fe4054b07ca9cc
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

State_ID: BigInt(0x0000000000000095)
Git_SHA: f4a3b2a1b0c9d8e7
Source_SHA256: f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Commands.Fuzzy (src/tui/commands/fuzzy.ts)

### [Signatures]
- `rankPaletteCommands(commands, query) => readonly RankedPaletteCommand[]`
- `getPaletteSuggestion(value, commands, selectedIndex) => string`
- `parsePaletteInput(value: string) => { commandQuery, args }`

### [Governance]
- depth_score: 0.72 — DEEP (scoring + ranking algorithm hidden behind 3-function interface)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-tui-commands-fuzzy-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Character-proximity scoring: position bonus for cursor-adjacent matches
- Filters commands with score > 0 before sorting — no zero-score results shown
- getPaletteSuggestion only active when no args present (pure command query)
- rankedOrder uses stable sort — name alphabetical as tiebreaker

State_ID: BigInt(0x4edd8a1d5369e943)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 4edd8a1d5369e943a92a215c16b184527ff3ccd8ff8326e4bc44eea36d00b913
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

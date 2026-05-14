---
State_ID: BigInt(0x0000000000000055)
Git_SHA: da56a6d328d9b1fae041e91050918aa0b6e21494
Source_SHA256: 75be10a5e510821ce95096b098d7ba0d740d463d9da2d64fc6d29aa383cd4fd6
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Analysis.Seams (src/commands/analysis/seams.ts)

### [Signatures]
- `makeSeamsCommand(registry: HashRegistryService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.72 — DEEP (registry read-only, high locality)
- seam_capacity: INTERNAL
- leverage: LOW (display only, no modification)
- SIG_ID: SIG-cmd-analysis-seams-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/fmcf/registry/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /seams command to HashRegistryService
- Reads all seams from registry
- Formats output as "id [capacity] — name"
- Uses readSeams() Effect channel
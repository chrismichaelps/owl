State_ID: BigInt(0x0000000000000055)
Git_SHA: da56a6d328d9b1fae041e91050918aa0b6e21494
Source_SHA256: 22e06ca5fb78996738269043a464bd0d83abab2862f07d78c09165506723a536
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

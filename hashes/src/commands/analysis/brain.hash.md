State_ID: BigInt(0x0000000000000051)
Git_SHA: da56a6d328d9b1fae041e91050918aa0b6e21494
Source_SHA256: 619a9c68118e1459fbce2f4e488eef79f5909f141eadb4722c5745573998408a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Analysis.Brain (src/commands/analysis/brain.ts)

### [Signatures]
- `makeBrainCommand(registry: HashRegistryService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.72 — DEEP (registry read-only, high locality)
- seam_capacity: INTERNAL
- leverage: LOW (display only, no modification)
- SIG_ID: SIG-cmd-analysis-brain-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/fmcf/registry/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /brain command to HashRegistryService
- Reads all subsystems from registry
- Formats output as "id — name (modules, invariants)"
- Uses readSubsystems() Effect channel

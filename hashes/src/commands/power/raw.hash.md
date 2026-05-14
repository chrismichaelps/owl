---
State_ID: BigInt(0x000000000000006B)
Git_SHA: 6761e2231cf557af57aa655249d13198dfa1ea22
Source_SHA256: 27d352329191fbe0712fb1b3e2f4c6b82b523cf5abfaf5189c8849446b4aa02d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Power.Raw (src/commands/power/raw.ts)

### [Signatures]
- `makeRawCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.68 — MEDIUM (raw inference with no preamble)
- seam_capacity: EXPLORATORY
- leverage: MEDIUM (direct inference without FMCF wrapper)
- SIG_ID: SIG-cmd-power-raw-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /raw <prompt> command to Orchestrator
- Mode: standard (no preamble wrapper)
- Requires prompt argument
- Passes raw prompt directly to orchestrator
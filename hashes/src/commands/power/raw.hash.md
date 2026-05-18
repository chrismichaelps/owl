State_ID: BigInt(0xa25c26ad759370c1)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: a25c26ad759370c1338a8fa4dec10c0cad83a3e556d63c70323f8a2ea138ef76
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

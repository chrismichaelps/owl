State_ID: BigInt(0x12536b63f0c72d58)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 12536b63f0c72d58d6e1e427171a8b9ddc5602585b739ce71575460f907c4570
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Analysis.Friction (src/commands/analysis/friction.ts)

### [Signatures]
- `makeFrictionCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.80 — DEEP (FMCF friction discovery with deep mode)
- seam_capacity: EXPLORATORY
- leverage: HIGH (identifies architectural friction points)
- SIG_ID: SIG-cmd-analysis-friction-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /friction <subject> command to Orchestrator
- Uses PREAMBLE for FMCF friction discovery prompt
- Mode: deep, requires subject argument
- Preamble: "You are an FMCF v3.5 Architect running Friction Discovery..."

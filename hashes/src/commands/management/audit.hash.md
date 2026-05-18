State_ID: BigInt(0x38311efc3885befa)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 38311efc3885befa52cb8826325f90cca470010ab1726038937786b10999b70b
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Management.Audit (src/commands/management/audit.ts)

### [Signatures]
- `makeAuditCommand(orchestrator: OrchestratorService) => CommandHandler`
- `CommandHandler: { name, description, execute(args) => Effect<CommandResult, CommandParseError> }`

### [Governance]
- depth_score: 0.82 — DEEP (FMCF governance audit with forensic preamble)
- seam_capacity: EXPLORATORY
- leverage: HIGH (evaluates FMCF compliance and invariants)
- SIG_ID: SIG-cmd-management-audit-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/orchestrator/index.hash.md`, `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Dispatches /audit <subject> command to Orchestrator
- Uses AUDIT_PREAMBLE for FMCF Forensic Guardian audit prompt
- Mode: deep, requires subject argument
- Preamble: "You are an FMCF v3.5 Forensic Guardian performing a governance audit..."

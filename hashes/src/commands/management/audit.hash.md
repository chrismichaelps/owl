State_ID: BigInt(0x0000000000000061)
Git_SHA: 45c6800bcea148e9ab367104707f7e30b7d58ca3
Source_SHA256: 08107a084f1c560e201d73052c0b4d78daa771c0cefdabd5ce6e852b45f6a500
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

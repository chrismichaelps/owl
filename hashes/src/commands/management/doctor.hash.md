State_ID: BigInt(0x3306b7c57a507605)
Git_SHA: 491eb0ba774a0e7ba96d1c698169e83a2d4a5125
Source_SHA256: 3306b7c57a5076052980df213e7f6e2abdaccafb07598e92974765b23898f68a
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T01:36:00Z
---

## @Owl.Commands.Management.Doctor (src/commands/management/doctor.ts)

### [Signatures]
- `makeDoctorCommand(deps: DoctorCommandDependencies) => CommandHandler`
- `formatDoctorSection(title: string, lines: Chunk<string>) => string`

### [Governance]
- depth_score: 0.72
- depth_status: DEEP
- seam_capacity: INTERNAL
- SIG_ID: SIG-commands-management-doctor-3306b7c5

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/factory.hash.md`
- Domain: `docs/CONTEXT.md#RuntimeDiagnostic`
- Dependency: `@root/hashes/src/providers/router/index.hash.md`
- Dependency: `@root/hashes/src/mcp/manager.hash.md`
- Dependency: `@root/hashes/src/tools/index.hash.md`
- Dependency: `@root/hashes/src/engine/memory/index.hash.md`
- Dependency: `@root/hashes/src/engine/metrics/index.hash.md`
- Dependency: `@root/hashes/src/tokens/cache/index.hash.md`

### [Architecture]
- Read-only RuntimeDiagnostic Command.
- Aggregates existing public service inspection methods.
- Does not call Provider adapters, Orchestrator, or mutation services.

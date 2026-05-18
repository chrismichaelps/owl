State_ID: BigInt(0x0000000000000000)
Git_SHA: PENDING
Source_SHA256: PENDING_SOURCE
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: SIGNATURE
Registry_Sync: 2026-05-18T01:12:00Z
---

## @Owl.Commands.Management.Doctor (src/commands/management/doctor.ts)

### [Signatures]
- `makeDoctorCommand(deps: DoctorCommandDependencies) => CommandHandler`
- `formatDoctorSection(title: string, lines: Chunk<string>) => string`

### [Governance]
- depth_score: 0.72
- depth_status: DEEP
- seam_capacity: INTERNAL
- SIG_ID: SIG-cmd-management-doctor-00000001

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

State_ID: BigInt(0xe09e658e722ee37d)
Git_SHA: a1dda9dfdf74a634867fb73d2a0ff5d22f9afb87
Source_SHA256: e09e658e722ee37d90a44a4400e8188f2846785ff13d77f47bb99023914458cd
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:23:42Z

---

## @root/src/commands/management/sessions.ts

### [Signatures]

- `makeSessionsCommand(sessionMemory: SessionMemoryService) => CommandHandler`
- `/sessions => CommandResult`

### [Governance]

- depth_score: 0.62
- depth_status: MEDIUM
- seam_capacity: INTERNAL
- SIG_ID: SIG-commands-management-sessions-e09e658e

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/factory.hash.md`
- Dependency: `@root/hashes/src/engine/memory/index.contract.json`

### [Architecture]

- Keeps Session list observability behind the SessionMemory Interface.
- Marks the active Session without mutating Session lifecycle state.
- Renders per-Session turn counts while marking the active Session.

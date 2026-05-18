State_ID: BigInt(0x942d273e22f64518)
Git_SHA: 11bd08dcb8efcd66015b64292dec79708f034bab
Source_SHA256: 942d273e22f645180412a88e13e4384b09228186d13362cfd72791f7013f34d9
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T15:01:53Z

---

## @root/src/commands/management/sessions.ts

### [Signatures]

- `makeSessionsCommand(sessionMemory: SessionMemoryService) => CommandHandler`
- `/sessions => CommandResult`

### [Governance]

- depth_score: 0.62
- depth_status: MEDIUM
- seam_capacity: INTERNAL
- SIG_ID: SIG-commands-management-sessions-942d273e

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/factory.hash.md`
- Dependency: `@root/hashes/src/engine/memory/index.contract.json`

### [Architecture]

- Keeps Session list observability behind the SessionMemory Interface.
- Marks the active Session without mutating Session lifecycle state.

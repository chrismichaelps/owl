State_ID: BigInt(0xa2126750a90f1108)
Git_SHA: a860618050fcbe430343a362dab18c79e4024667
Source_SHA256: a2126750a90f1108a87c949f4ae125092fc9e889933163b2696dc63c00da3d65
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:36:53Z

---

## @root/src/commands/management/new.ts

### [Signatures]

- `makeNewCommand(sessionMemory: SessionMemoryService) => CommandHandler`
- `/new [sessionId] => CommandResult`

### [Governance]

- depth_score: 0.62
- depth_status: MEDIUM
- seam_capacity: INTERNAL
- SIG_ID: SIG-commands-management-new-a2126750

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/factory.hash.md`
- Dependency: `@root/hashes/src/engine/memory/index.contract.json`

### [Architecture]

- Keeps blank Session creation behind the SessionMemory Interface.
- Returns compact deterministic command output for command-thread rendering.

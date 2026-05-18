State_ID: BigInt(0x09e0c728be9ad141)
Git_SHA: 2fcb8a42455d8bbc71b152f6c893a1d8706db7e6
Source_SHA256: 09e0c728be9ad14141e669d1e88850d0424ff0f8b3da7076fe51e919c909b815
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:34:21Z

---

## @root/src/commands/management/resume.ts

### [Signatures]

- `makeResumeCommand(sessionMemory: SessionMemoryService) => CommandHandler`
- `/resume [sessionId] => CommandResult`

### [Governance]

- depth_score: 0.62
- depth_status: MEDIUM
- seam_capacity: INTERNAL
- SIG_ID: SIG-commands-management-resume-09e0c728

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/factory.hash.md`
- Dependency: `@root/hashes/src/engine/memory/index.contract.json`

### [Architecture]

- Keeps Session lifecycle switching behind the SessionMemory Interface.
- Returns compact deterministic command output for command-thread rendering.

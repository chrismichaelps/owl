---
Module: @root/src/commands/management/resume.ts
State_ID: BigInt(0x09e0c728be9ad141)
---

## Algorithm

1. Build a CommandHandler named `resume`.
2. If no Session id argument is provided, read the active Session id from SessionMemory.
3. If a Session id argument is provided, call SessionMemory.resumeSession with that id.
4. Return a compact success message containing the active Session id.
5. Wrap typed SessionMemory failures into CommandParseError so CommandRegistry dispatch remains stable.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Start a new Session when `/resume` is called without arguments.
- MUST NOT: Read or write files directly; SessionMemory owns persistence.
- MUST NOT: Clear existing Session turns during resume.
- MUST NOT: Use Provider routing or Orchestrator services.

## Edge Cases

- Missing Session id: report the current active Session.
- Unknown Session id: SessionMemory creates or targets that id using its deterministic resume semantics.
- Persistence failure: return a CommandParseError with the original diagnostic string.

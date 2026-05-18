---
Module: @root/src/commands/management/new.ts
State_ID: BigInt(0xa2126750a90f1108)
---

## Algorithm

1. Build a CommandHandler named `new`.
2. If no Session id argument is provided, call SessionMemory.startSession without an id.
3. If a Session id argument is provided, call SessionMemory.startSession with that id.
4. Return a compact success message containing the active Session id.
5. Wrap typed SessionMemory failures into CommandParseError so CommandRegistry dispatch remains stable.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Use SessionMemory.resumeSession for `/new`; creation must create an empty active Session.
- MUST NOT: Clear other persisted Sessions.
- MUST NOT: Read or write files directly; SessionMemory owns persistence.
- MUST NOT: Use Provider routing or Orchestrator services.

## Edge Cases

- Missing Session id: generate the next deterministic Session id.
- Provided Session id: create an empty Session with that id.
- Persistence failure: return a CommandParseError with the original diagnostic string.

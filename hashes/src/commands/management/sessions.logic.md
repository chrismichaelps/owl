---
Module: @root/src/commands/management/sessions.ts
State_ID: BigInt(0x942d273e22f64518)
---

## Algorithm

1. Build a CommandHandler named `sessions`.
2. Read active Session id from SessionMemory.
3. Read the deterministic list of known Session ids from SessionMemory.
4. Render each Session id on its own line, marking the active Session.
5. Return a compact CommandResult for conversation-thread display.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: inspect SessionMemory internals directly.
- MUST NOT: sort in the command; SessionMemory owns deterministic ordering.
- MUST NOT: start, resume, or clear Sessions.

## Edge Cases

- Empty list is not expected because SessionMemory always has an active Session.
- Active Session not present in list: render the active Session as the only fallback row.

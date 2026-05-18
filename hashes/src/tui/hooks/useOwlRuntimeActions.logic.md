---
Module: @root/src/tui/hooks/useOwlRuntimeActions.ts
State_ID: BigInt(0x6c3c6aa9c1ff00d8)
---

## Algorithm

1. Load the module through its public imports.
2. Dispatch slash commands through CommandRegistry.
3. When the command changes the active Session, read SessionMemory turns and project them through the TUI Session sync helper.
4. Dispatch SET_TURNS before appending the lifecycle command result.
5. Propagate typed results and tagged errors according to the grammar lock.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Bypass the registered module interface.
- MUST NOT: Introduce untyped runtime boundaries.
- MUST NOT: Depend on OS-absolute project paths.
- MUST NOT: project SessionMemory turns inline; use the TUI Session sync helper.

## Edge Cases

- Missing dependencies: fail through the caller's typed error channel.
- Empty input collections: preserve deterministic no-op behavior.

---
Module: @root/src/providers/anthropic/toolResult.ts
State_ID: BigInt(0xf0d13fa6cb8d19b1)
---

## Algorithm

1. Load the module through its public imports.
2. Execute only the behavior exposed by the module interface.
3. Propagate typed results and tagged errors according to the grammar lock.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Bypass the registered module interface.
- MUST NOT: Introduce untyped runtime boundaries.
- MUST NOT: Depend on OS-absolute project paths.

## Edge Cases

- Missing dependencies: fail through the caller's typed error channel.
- Empty input collections: preserve deterministic no-op behavior.

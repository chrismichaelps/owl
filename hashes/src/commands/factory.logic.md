---
Module: @root/src/commands/factory.ts
State_ID: BigInt(0x182149fc0d9d2490)
---

## Algorithm

1. Load the module through its public imports.
2. Build the full Chunk of Command handlers from injected service dependencies.
3. Include Session lifecycle handlers such as `/resume` through the same SessionMemory dependency used by `/history` and `/memory`.
4. Include the RuntimeDiagnostic `/doctor` handler after its contract is implemented.
5. Execute only the behavior exposed by the module interface.
6. Propagate typed results and tagged errors according to the grammar lock.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Bypass the registered module interface.
- MUST NOT: Introduce untyped runtime boundaries.
- MUST NOT: Depend on OS-absolute project paths.
- MUST NOT: construct Session lifecycle handlers with a different SessionMemory instance than the runtime shell.
- MUST NOT: register `/doctor` before its source module matches `doctor.contract.json`.

## Edge Cases

- Missing dependencies: fail through the caller's typed error channel.
- Empty input collections: preserve deterministic no-op behavior.
- Missing RuntimeDiagnostic services: omit `/doctor` registration only during compile-time failure, never at runtime.

---
Module: @root/src/tools/index.ts
State_ID: BigInt(0x35aac1f3fcf444c0)
---

## Algorithm

1. Load the module through its public imports.
2. Expose all built-in tool descriptors and ToolRisk assessment through the public BuiltInTools service.
3. When `callTool` is invoked, resolve the tool by name.
4. Classify ToolRisk from the tool name and input payload before execution.
5. If ToolRisk is BLOCKED, fail with ToolExecutionError and do not execute the tool.
6. Expose Permission decisions by resolving the classified ToolRisk through the Permission seam.
7. For LOW, MEDIUM, and HIGH risk levels, preserve current execution behavior until interactive Permission enforcement is implemented.
8. Propagate typed results and tagged errors according to the grammar lock.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Bypass the registered module interface.
- MUST NOT: Introduce untyped runtime boundaries.
- MUST NOT: Depend on OS-absolute project paths.
- MUST NOT: Execute a BLOCKED ToolRisk invocation.
- MUST NOT: Convert BLOCKED ToolRisk into a warning-only event.
- MUST NOT: Recompute Permission without preserving the original ToolRisk assessment.

## Edge Cases

- Missing dependencies: fail through the caller's typed error channel.
- Empty input collections: preserve deterministic no-op behavior.
- Unknown tools: fail as ToolExecutionError before ToolRisk enforcement.
- BLOCKED Bash commands: fail before spawning a process.
- Permission ASK decisions: report through command visibility but do not block execution until interactive prompts are implemented.

---
Module: @root/src/tools/index.ts
State_ID: BigInt(0x2d2422c1cdcc9cc1)
---

## Algorithm

1. Load the module through its public imports.
2. Expose all built-in tool descriptors and ToolRisk assessment through the public BuiltInTools service.
3. When `callTool` is invoked, resolve the tool by name.
4. Classify ToolRisk from the tool name and input payload before execution.
5. Read the current session Permission mode from ToolPermissionState.
6. Resolve the classified ToolRisk and current Permission mode through the Permission seam.
7. If Permission behavior is DENY, fail with ToolExecutionError and do not execute the tool.
8. If Permission behavior is ASK, fail with ToolExecutionError until the TUI owns an interactive approval prompt.
9. If Permission behavior is ALLOW, execute the registered tool implementation.
10. Propagate typed results and tagged errors according to the grammar lock.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Bypass the registered module interface.
- MUST NOT: Introduce untyped runtime boundaries.
- MUST NOT: Depend on OS-absolute project paths.
- MUST NOT: Execute a BLOCKED ToolRisk invocation.
- MUST NOT: Convert BLOCKED ToolRisk into a warning-only event.
- MUST NOT: Recompute Permission without preserving the original ToolRisk assessment.
- MUST NOT: Execute ASK Permission decisions without an explicit interactive approval surface.
- MUST NOT: Maintain a separate Permission mode state from the CLI session state.

## Edge Cases

- Missing dependencies: fail through the caller's typed error channel.
- Empty input collections: preserve deterministic no-op behavior.
- Unknown tools: fail as ToolExecutionError before ToolRisk enforcement.
- BLOCKED Bash commands: fail before spawning a process.
- Permission ASK decisions: fail before execution until interactive prompts are implemented.
- Bypass Permission mode: allow HIGH ToolRisk while still denying BLOCKED ToolRisk.

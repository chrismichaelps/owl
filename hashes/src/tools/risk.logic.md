---
Module: @root/src/tools/risk.ts
State_ID: BigInt(0x0000000000000000)
---

# Logic Blueprint: @Owl.Tools.Risk src/tools/risk.ts

## Algorithm

1. Receive a built-in tool name and optional input payload.
2. For known read-only tools, return LOW risk.
3. For file Mutation tools, return MEDIUM risk.
4. For Bash:
   - Extract the command string only if input has a string `command` field.
   - Normalize the command to lower-case text.
   - If any blocked shell pattern is present, return BLOCKED risk.
   - If the first command token is in the read-only shell allowlist, return MEDIUM risk with read-only confidence.
   - Otherwise return HIGH risk.
5. For unknown tools, return HIGH risk.
6. Format ToolRisk as compact text for command rendering.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: execute a command to determine risk.
- MUST NOT: read the file system to determine risk.
- MUST NOT: assume shell parsing is complete; unknown Bash commands stay HIGH.
- MUST NOT: hide BLOCKED classifications.
- MUST NOT: use mutable global state.

## Edge Cases

- **Missing Bash command**: HIGH risk with an explanatory reason.
- **Unknown tool name**: HIGH risk with an explanatory reason.
- **Uppercase command text**: normalize before pattern checks.
- **Compound shell commands**: blocked patterns win; otherwise unknown commands remain HIGH.

## Dependencies

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tools/index.hash.md`
- Domain: `docs/CONTEXT.md#ToolRisk`

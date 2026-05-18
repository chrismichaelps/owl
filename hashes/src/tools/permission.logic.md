---
Module: @root/src/tools/permission.ts
State_ID: BigInt(0x3552f24b15491d4e)
---

# Logic Blueprint: @Owl.Tools.Permission src/tools/permission.ts

## Algorithm

1. Receive an existing ToolRiskAssessment and an optional permission Mode.
2. Default missing Mode to `default`.
3. If ToolRisk is BLOCKED, return a deny Permission decision regardless of Mode.
4. Resolve behavior by Mode:
   - `plan`: allow LOW risk and deny MEDIUM or HIGH risk.
   - `dontAsk`: allow LOW or MEDIUM risk and deny HIGH risk.
   - `acceptEdits`: allow LOW or MEDIUM risk and ask for HIGH risk.
   - `bypassPermissions`: allow LOW, MEDIUM, or HIGH risk.
   - `default`: allow LOW or MEDIUM risk and ask for HIGH risk.
5. Return a Data.struct decision containing behavior, reason, mode, and the original ToolRisk.
6. Format Permission decisions as compact text for command rendering.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: execute a tool to decide Permission.
- MUST NOT: recompute ToolRisk from raw tool input.
- MUST NOT: allow a BLOCKED ToolRisk.
- MUST NOT: perform interactive prompting.
- MUST NOT: use mutable global state.

## Edge Cases

- **Missing Mode**: use `default`.
- **BLOCKED risk in bypass mode**: deny; bypass never overrides blocklist safety.
- **Unknown future risk level**: TypeScript exhaustiveness must force a compiler failure.
- **Unknown future Mode**: TypeScript exhaustiveness must force a compiler failure.

## Dependencies

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/tools/index.hash.md`
- Domain: `docs/CONTEXT.md#Permission`

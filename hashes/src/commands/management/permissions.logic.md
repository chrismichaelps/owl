---
Module: @root/src/commands/management/permissions.ts
State_ID: BigInt(0x7da04798221e38b1)
---

# Logic Blueprint: @Owl.Commands.Management.Permissions src/commands/management/permissions.ts

## Algorithm

1. Receive slash command args.
2. If no arg or arg is `status`, read Permission state snapshot and render current mode plus valid modes.
3. Otherwise parse the requested mode through `parseToolPermissionMode`.
4. If parsing fails, return CommandParseError with usage text.
5. If parsing succeeds, set Permission mode through ToolPermissionState and return confirmation.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: hardcode valid modes in the command.
- MUST NOT: mutate Permission state directly.
- MUST NOT: execute tool calls.
- MUST NOT: treat `/permissions` as `/tools`.

## Edge Cases

- **Unknown mode**: fail with CommandParseError.
- **status alias**: render state without mutation.
- **Repeated mode set**: return deterministic confirmation.

## Dependencies

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Domain: `docs/CONTEXT.md#Permission`

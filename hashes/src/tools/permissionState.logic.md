---
Module: @root/src/tools/permissionState.ts
State_ID: BigInt(0x03c01ae9dd701d38)
---

# Logic Blueprint: @Owl.Tools.PermissionState src/tools/permissionState.ts

## Algorithm

1. Construct Permission state through `makeToolPermissionStateService`.
2. Initialize a Ref with Permission mode `default`.
3. Expose `getMode` by reading the Ref.
4. Expose `setMode` by replacing the Ref with a validated ToolPermissionMode value.
5. Expose `snapshot` by returning Data.struct with current mode and ordered modes as Chunk.
6. Expose `ToolPermissionStateLive` by wrapping the same constructor in a Layer.
7. Expose `parseToolPermissionMode` by checking membership against the centralized HashSet.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: use native Set for mode membership.
- MUST NOT: use native arrays for ordered mode snapshots.
- MUST NOT: persist state outside the Session.
- MUST NOT: accept unknown Permission modes.

## Edge Cases

- **Unknown mode text**: return Option.none.
- **Repeated set to same mode**: deterministic no-op through Ref.set.
- **Snapshot after set**: must return the latest Ref value.

## Dependencies

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Domain: `docs/CONTEXT.md#Permission`

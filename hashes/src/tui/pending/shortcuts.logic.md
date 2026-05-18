---
Module: @root/src/tui/pending/shortcuts.ts
State_ID: BigInt(0xd7835d0b0243124f)
---

# Logic Blueprint: @Owl.TUI.Pending.Shortcuts src/tui/pending/shortcuts.ts

## Algorithm

1. Receive a raw keyboard input string, the currently focused TUI panel, and a Chunk of pending Mutation IDs.
2. If the focused panel is not Metrics, return Option.none.
3. If no pending Mutation IDs are present, return Option.none.
4. Read the first pending Mutation ID from the Chunk as the default target.
5. Match the input against centralized TUI pending approval shortcut constants.
6. Return a Data struct containing the action, mutation ID, and slash command string.
7. Return Option.none for all unmatched keys.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: trigger slash command dispatch directly.
- MUST NOT: read PendingMutationStore; App already owns visible pending IDs.
- MUST NOT: use native Array indexing for pending Mutation lookup.
- MUST NOT: activate when PromptInput is the active interaction surface.
- MUST NOT: create commands for unknown Mutation IDs.

## Edge Cases

- **No pending Mutations**: no shortcut resolves.
- **Wrong panel focus**: no shortcut resolves so normal typing stays safe.
- **Unknown key**: no shortcut resolves.
- **Multiple pending Mutations**: first visible Mutation is targeted deterministically.

## Dependencies

- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Domain: `docs/CONTEXT.md#Mutation`

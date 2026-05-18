---
Module: @root/src/tui/session/sync.ts
State_ID: BigInt(0x080090e3eb526868)
---

## Algorithm

1. Accept a Chunk of schema-validated SessionTurn records.
2. Map each SessionTurn into an inference ConversationTurn.
3. Preserve task id, prompt, response, timestamp, model, latency, and cost metadata when available.
4. Use deterministic fallback metadata when older Session turns do not contain Provider fields.
5. Return a readonly array suitable for OwlAction.SET_TURNS.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: query SessionMemory from this helper.
- MUST NOT: mutate the input Chunk.
- MUST NOT: throw when optional Provider metadata is missing.
- MUST NOT: generate timestamps while mapping persisted turns.

## Edge Cases

- Empty Session: return an empty array.
- Missing Provider: use a local display Provider label.
- Missing model: use a stable unknown model label.

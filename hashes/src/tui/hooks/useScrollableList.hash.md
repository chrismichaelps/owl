State_ID: BigInt(0x0000000000000097)
Git_SHA: b2a1b0c9d8e7f6a5
Source_SHA256: b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Hooks.ScrollableList (src/tui/hooks/useScrollableList.ts)

### [Signatures]
- `useScrollableList({ totalItems, visibleRows, isActive }) => UseScrollableListResult`
- `UseScrollableListResult: { scrollOffset, canScrollUp, canScrollDown, scrollToBottom }`

### [Governance]
- depth_score: 0.70 — MEDIUM (keyboard scroll state with Ink useInput integration)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-tui-hooks-scroll-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Handles PageUp/PageDown and Shift+Up/Down when isActive=true
- Uses a ref for the current offset to avoid stale closure in useInput
- scrollToBottom is a stable callback for auto-follow behavior
- Clamps offset to [0, maxOffset] — never out of bounds

State_ID: BigInt(0x220ad3d69763e2db)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 220ad3d69763e2db4a0fb81db6ef3e4069c402a99dfc2af13395c00b8e9aa0d7
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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

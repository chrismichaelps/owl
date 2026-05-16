State_ID: BigInt(0x00000000000000a4)
Git_SHA: e4f5a6b7c8d9e0f1
Source_SHA256: e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.ShortcutsOverlay (src/tui/components/ShortcutsOverlay.tsx)

### [Signatures]
- `ShortcutsOverlay: React.FC`
- `formatShortcutKey(key: string) => string`

### [Governance]
- depth_score: 0.52 — MEDIUM (static keyboard reference panel, pure render)
- seam_capacity: INTERNAL
- leverage: LOW
- SIG_ID: SIG-tui-cmp-shortcuts-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Renders a static, non-interactive keyboard guide panel
- formatShortcutKey pads key labels to KEY_COLUMN_WIDTH for alignment
- TUI_SHORTCUTS list is the single source of truth — no duplication here
- Panel width driven by TUI_SHORTCUTS_LAYOUT.PANEL_WIDTH constant

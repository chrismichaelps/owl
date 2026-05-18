State_ID: BigInt(0x433bf5b96daf7e16)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 433bf5b96daf7e1651f0be055973cd3d5dbdd94c7f1a4d65538e90c2a857b76f
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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

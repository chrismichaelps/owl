State_ID: BigInt(0x58e2c24f1f14ebe7)
Git_SHA: e44dbd9d3e552a3bc9b1aa2e5c8ab21d64ca7da6
Source_SHA256: 58e2c24f1f14ebe78fa023ec61075e3e9b6d69591c0f7cdbefda4a498f351671
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE

---

## @Owl.TUI.Components.LogPanel (src/tui/components/LogPanel.tsx)

### [Signatures]

- `LogPanel(props: LogPanelProps) => ReactElement`

### [Governance]

- depth_score: 0.72 — DEEP (log display)
- seam_capacity: INTERNAL (log rendering)
- leverage: MEDIUM (displays system logs)
- SIG_ID: SIG-tui-components-LogPanel-58e2c24f

### [Linkage]

- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]

- Scrollable log display with timestamps
- Auto-scroll to latest entry
- Formatted timestamp display (HH:mm:ss A)
- Renders the current execution stage beside status and FMCF role context.

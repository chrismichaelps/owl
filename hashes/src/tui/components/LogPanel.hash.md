State_ID: BigInt(0x0000000000000026)
Git_SHA: bcdd88c31523b2c371528d153c91214fb34715e3
Source_SHA256: 0f0bd95c7797230be7bb3281bea6979a3309fe30997b806fb4ec47463df7d2af
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.LogPanel (src/tui/components/LogPanel.tsx)

### [Signatures]
- `LogPanel(props: LogPanelProps) => ReactElement`

### [Governance]
- depth_score: 0.72 — DEEP (log display)
- seam_capacity: INTERNAL (log rendering)
- leverage: MEDIUM (displays system logs)
- SIG_ID: SIG-tui-components-log-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Scrollable log display with timestamps
- Auto-scroll to latest entry
- Formatted timestamp display (HH:mm:ss A)

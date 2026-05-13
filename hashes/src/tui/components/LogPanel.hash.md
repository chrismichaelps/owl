---
State_ID: BigInt(0x0000000000000026)
Git_SHA: bcdd88c9e2f1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
Source_SHA256: 3156f095b45ccfc822995002fa6d154c691cb4070de3b995008460b04c03ce08
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

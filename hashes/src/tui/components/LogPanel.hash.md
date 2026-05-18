State_ID: BigInt(0x576ea507106f8a0d)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 576ea507106f8a0d5cff3b96ced1bd0437bf020e858c6cc5f508ef5d2357e7ba
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
- SIG_ID: SIG-tui-components-log-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Scrollable log display with timestamps
- Auto-scroll to latest entry
- Formatted timestamp display (HH:mm:ss A)

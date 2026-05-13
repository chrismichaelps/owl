---
State_ID: BigInt(0x0000000000000032)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 3156f095b45ccfc822995002fa6d154c691cb4070de3b995008460b04c03ce08
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.LogPanel (src/tui/components/LogPanel.tsx)

### [Signatures]
- `LogPanel(props: LogPanelProps) => React.ReactElement`

### [Governance]
- depth_score: 0.65 — MEDIUM (display logic for logs and status)
- seam_capacity: INTERNAL (tui component)
- leverage: MEDIUM (role and status visualization)
- SIG_ID: SIG-tui-comp-log-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/src/tui/state.js`

### [Architecture]
- Left-side panel for engine logs and active role status
- Role-specific color coding (Architect, DNA Engineer, etc.)
- Truncated log history view (latest 18 entries)

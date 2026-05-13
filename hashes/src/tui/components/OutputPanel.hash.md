---
State_ID: BigInt(0x0000000000000034)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 6885f3b925f45734bbed36f49a216f9f9a2a9e075b724c01b3dd2bf16cec8721
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.OutputPanel (src/tui/components/OutputPanel.tsx)

### [Signatures]
- `OutputPanel(props: OutputPanelProps) => React.ReactElement`

### [Governance]
- depth_score: 0.65 — MEDIUM (central response and spinner display)
- seam_capacity: INTERNAL (tui component)
- leverage: MEDIUM (inference feedback visualization)
- SIG_ID: SIG-tui-comp-output-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/src/tui/components/Spinner.js`

### [Architecture]
- Center panel for primary engine output
- Integrated loading spinner for 'thinking' states
- Responsive height adjustment based on TUI state

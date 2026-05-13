---
State_ID: BigInt(0x0000000000000033)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: a3a77d0ffff17046039f7f683b72ef3a27f3ae7ce8367834137d8d3bec29fdd5
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.MetaPanel (src/tui/components/MetaPanel.tsx)

### [Signatures]
- `MetaPanel(props: MetaPanelProps) => React.ReactElement`

### [Governance]
- depth_score: 0.60 — MEDIUM (telemetry display and legend)
- seam_capacity: INTERNAL (tui component)
- leverage: MEDIUM (token and session metrics visualization)
- SIG_ID: SIG-tui-comp-meta-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/src/tui/state.js`

### [Architecture]
- Right-side panel for session telemetry and role legend
- Real-time token usage and turn count display
- Color-coded role legend (Architect, DNA Engineer, Shadow, Guardian)

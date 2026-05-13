---
State_ID: BigInt(0x0000000000000037)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: aeec040348c74dc6a224af08d8a695b9dafdec8c0c0c393cd6342c03d45cc135
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.StatusBar (src/tui/components/StatusBar.tsx)

### [Signatures]
- `StatusBar(props: StatusBarProps) => React.ReactElement`

### [Governance]
- depth_score: 0.60 — MEDIUM (debounced telemetry display)
- seam_capacity: INTERNAL (tui component)
- leverage: MEDIUM (global session status visualization)
- SIG_ID: SIG-tui-comp-status-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: []

### [Architecture]
- Bottom-docked status bar for global session metrics
- Implements debounced updates to prevent visual jitter
- Displays session duration, total tokens, and turn count
- Dynamically highlights active engine status (Idle vs. Thinking)

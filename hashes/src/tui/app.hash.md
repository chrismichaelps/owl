---
State_ID: BigInt(0x0000000000000031)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 7c24fc54418d174410910e981f4a204920ce40d8ba77b7edd6a2e242e6b8545b
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.App (src/tui/app.tsx)

### [Signatures]
- `App(props: AppProps) => React.ReactElement`

### [Governance]
- depth_score: 0.70 — DEEP (composition of 3-panel layout + orchestrator wiring)
- seam_capacity: BACKBONE (ui root)
- leverage: HIGH (wires TUI state to Engine Orchestrator)
- SIG_ID: SIG-tui-app-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Imports: `@root/src/tui/components/*.js`, `@root/src/tui/state.js`, `@root/src/engine/orchestrator/index.js`

### [Architecture]
- Root TUI component orchestrating the 3-panel layout
- Manages mode state and task submission via Orchestrator
- Handles async Effect execution within the React lifecycle

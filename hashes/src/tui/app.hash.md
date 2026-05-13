---
State_ID: BigInt(0x0000000000000030)
Git_SHA: af2fbe939e075d19e000ab3703eeeb07b1dbec3a
Source_SHA256: 7c24fc54418d174410910e981f4a204920ce40d8ba77b7edd6a2e242e6b8545b
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.App (src/tui/app.tsx)

### [Signatures]
- `OwlApp(props: OwlAppProps) => ReactElement`

### [Governance]
- depth_score: 0.82 — DEEP (main layout shell)
- seam_capacity: BACKBONE (connects all TUI components)
- leverage: CRITICAL (renders entire UI)
- SIG_ID: SIG-tui-app-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Child: `@root/hashes/src/tui/state.hash.md`, `@root/hashes/src/tui/components/*.hash.md`
- Uses: `@root/src/tui/state.js`, `@root/src/tui/components/*.js`

### [Architecture]
- Root application shell using Ink + React
- Manages OwlAppState via useReducer hook
- Integrates all TUI panel components into unified layout
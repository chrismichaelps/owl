---
State_ID: BigInt(0x0000000000000030)
Git_SHA: b6b78075c6642d82327f887c2c3bdd57c3eeb2a1
Source_SHA256: b49e3078d310857cc863beefe9d0cd0016cd35704a4adb80d15f0c406b0aa4f7
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
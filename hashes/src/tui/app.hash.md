---
State_ID: BigInt(0x0000000000000030)
Git_SHA: 05b86b3
Source_SHA256: 1f2ce0dd0f6a4e6c913f4046ab3d4e58ec7af7d62e3c9ac6c8e7d758e44412fd
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
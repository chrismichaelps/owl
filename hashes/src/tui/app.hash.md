State_ID: BigInt(0x0000000000000055)
Git_SHA: 695c5f2d1abff2c7b2db1bdd2f54e72b44c1839d
Source_SHA256: 0e99fa80a00e0632469fe00203d01ea8a35eacc0e3b86ddbbe617e1276bc4902
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

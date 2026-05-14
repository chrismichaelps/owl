State_ID: BigInt(0x000000000000002a)
Git_SHA: bcdd88c31523b2c371528d153c91214fb34715e3
Source_SHA256: 3d29d35e9efbcbd5213ea51975e7e9da34c51cf92d89e6240b1bb93b3bd968bd
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.Spinner (src/tui/components/Spinner.tsx)

### [Signatures]
- `Spinner(props: SpinnerProps) => ReactElement`

### [Governance]
- depth_score: 0.55 — SHALLOW (simple animation)
- seam_capacity: INTERNAL (loading indicator)
- leverage: LOW (visual feedback)
- SIG_ID: SIG-tui-components-spinner-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- ASCII spinner animation (◐ ◓ ◑ ◔ cycle)
- Configurable label and color
- 100ms animation interval

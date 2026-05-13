---
State_ID: BigInt(0x000000000000002a)
Git_SHA: bcdd88c9e2f1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
Source_SHA256: 264ea86bd099f515bc937ccc190666da11c5ac62bfa35ded29db235c94ec9f66
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

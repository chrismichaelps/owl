State_ID: BigInt(0xd379f2287fd96b6b)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: d379f2287fd96b6b634a278eb273be1b793c1d33834619d5429e0b5602cc8d64
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
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

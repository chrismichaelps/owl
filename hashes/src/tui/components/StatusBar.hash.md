State_ID: BigInt(0xf814a22f8a4d9cc3)
Git_SHA: 8c574e7ae88d2c472e80f4908473ef70cbfe5469
Source_SHA256: f814a22f8a4d9cc3989b335ca633529628e9bea59741be3d5db443c29eb828c6
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.Components.StatusBar (src/tui/components/StatusBar.tsx)

### [Signatures]
- `StatusBar(props: StatusBarProps) => ReactElement`

### [Governance]
- depth_score: 0.65 — SHALLOW (status display)
- seam_capacity: INTERNAL (status rendering)
- leverage: LOW (displays status text)
- SIG_ID: SIG-tui-components-status-f814a22f

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Bottom-anchored status display
- Shows current mode and status
- Shows current Permission mode in the persistent bottom chrome
- Simple text-based status indicator

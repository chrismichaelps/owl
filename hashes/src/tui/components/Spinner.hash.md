---
State_ID: BigInt(0x0000000000000036)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 264ea86bd099f515bc937ccc190666da11c5ac62bfa35ded29db235c94ec9f66
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.Spinner (src/tui/components/Spinner.tsx)

### [Signatures]
- `Spinner() => React.ReactElement`

### [Governance]
- depth_score: 0.50 — MEDIUM (animation logic)
- seam_capacity: INTERNAL (tui component)
- leverage: LOW (visual feedback only)
- SIG_ID: SIG-tui-comp-spinner-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/components/OutputPanel.hash.md`
- Imports: []

### [Architecture]
- Animated Braille-based spinner for inference states
- Uses React useEffect for frame-by-frame animation (80ms interval)
- Zero-dependency implementation for maximum stability

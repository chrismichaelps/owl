---
State_ID: BigInt(0x0000000000000029)
Git_SHA: bcdd88c9e2f1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
Source_SHA256: 2e2f96e5117ef31e4c8a51cbdccf6ce5b97175b11cd0c41bb6d24e955e3e01da
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.PromptInput (src/tui/components/PromptInput.tsx)

### [Signatures]
- `PromptInput(props: PromptInputProps) => ReactElement`

### [Governance]
- depth_score: 0.78 — DEEP (user input handling)
- seam_capacity: CRITICAL (primary input)
- leverage: HIGH (user interaction entry point)
- SIG_ID: SIG-tui-components-prompt-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Text input with submit handler
- Disabled during inferring/error states
- Handles Enter key submission

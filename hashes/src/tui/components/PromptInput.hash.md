---
State_ID: BigInt(0x0000000000000029)
Git_SHA: 1e742d8
Source_SHA256: aecca77f9541e29f94a580ecd805291e834a2e689ce3d1d9cb3af6142187f025
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

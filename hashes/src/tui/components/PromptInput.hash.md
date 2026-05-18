State_ID: BigInt(0x98b459d71fe146c2)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 98b459d71fe146c218f7d4c1695cd04ee2b74e72ca1acc8e89da248f4225029c
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

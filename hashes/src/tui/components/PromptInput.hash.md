State_ID: BigInt(0x3ebd01f9d40c7094)
Git_SHA: 17aac6a64ad21f503da780d4cc8d5f7b2be5e041
Source_SHA256: 3ebd01f9d40c70941213c6a869e84a19995bd50cfa845cb1202314cd02fe2cc2
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
- SIG_ID: SIG-tui-components-PromptInput-3ebd01f9

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Text input with submit handler
- Disabled during inferring/error states
- Handles Enter key submission

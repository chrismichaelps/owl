---
State_ID: BigInt(0x0000000000000035)
Git_SHA: ff25474c0fce993cc6657f6c7d440faedf06aac9
Source_SHA256: 2e2f96e5117ef31e4c8a51cbdccf6ce5b97175b11cd0c41bb6d24e955e3e01da
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
---

## @Owl.TUI.Components.PromptInput (src/tui/components/PromptInput.tsx)

### [Signatures]
- `PromptInput(props: PromptInputProps) => React.ReactElement`

### [Governance]
- depth_score: 0.75 — DEEP (REPL logic, slash commands, mode switching)
- seam_capacity: INTERNAL (tui component)
- leverage: HIGH (primary interaction point)
- SIG_ID: SIG-tui-comp-prompt-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `@root/src/core/schema/index.js`

### [Architecture]
- Keyboard-first REPL input for the Owl TUI
- Supports slash commands (/mode, /clear) for fast orchestration
- Integrated mode indicators and validation
- Prevents multi-line input drift via constrained prompt logic

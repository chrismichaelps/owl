State_ID: BigInt(0xcc4e5162973e7483)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: cc4e5162973e74838e95f724c1a92a19a277e8cc4be8933f95104c9303c52659
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.Hooks.PromptHistory (src/tui/hooks/usePromptHistory.ts)

### [Signatures]
- `usePromptHistory() => UsePromptHistoryResult`
- `UsePromptHistoryResult: { historyIndex: number; push: (entry: string) => void; up: (currentInput: string) => string; down: () => string; reset: () => void }`

### [Governance]
- depth_score: 0.68 — DEEP (encapsulates history nav state)
- seam_capacity: INTERNAL
- leverage: MEDIUM (enables arrow key navigation)
- SIG_ID: SIG-tui-hist-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/index.hash.md`
- Used by: `@root/hashes/src/tui/components/PromptInput.hash.md`

### [Architecture]
- Pure in-memory arrow key history navigation
- Tracks historyIndex: -1 = current draft, 0..n = history entries
- Skips duplicate consecutive entries
- Reset on submit to return to current draft

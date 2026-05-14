State_ID: BigInt(0x0000000000000041)
Git_SHA: e960ac9f0de476b270ebb1d7d3e751c79d10db39
Source_SHA256: 673e0497b9ed877b857a5f43711a64db3207d6d1038e5253c365a5836d6d94c8
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
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

State_ID: BigInt(0xc56549e3ef86741b)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: c56549e3ef86741b14e79861bdeddf8db3813c1d95df7799c80d72673672fdf1
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.Components.ConversationThread (src/tui/components/ConversationThread.tsx)

### [Signatures]
- `ConversationThread(props: ConversationThreadProps) => ReactElement`
- `TurnRow({ turn }: { turn: ConversationTurn }) => ReactElement`

### [Governance]
- depth_score: 0.72 — DEEP (renders full session thread)
- seam_capacity: CRITICAL
- leverage: HIGH (displays all conversation history)
- SIG_ID: SIG-tui-conv-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/react/react.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`
- Imports: `ConversationTurn` from `../state.js`
- Rendered by: `@root/hashes/src/tui/components/OutputPanel.hash.md`

### [Architecture]
- Renders scrollable list of all completed turns
- memoized for performance
- Shows user prompt (cyan ❯) and assistant response
- Displays metadata: provider, latency, tokens

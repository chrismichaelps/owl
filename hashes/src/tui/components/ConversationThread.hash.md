---
State_ID: BigInt(0x0000000000000040)
Git_SHA: a5d0d44eb4c1a43ade80a823360bfb8da0e57add
Source_SHA256: 22a28d3df80a13ad66ae0c663bd49f4fffd924d27f188bb3717ae10ef362bb61
Grammar_Lock: "@root/hashes/grammar/react/react.hash.md"
Fidelity: DECLARED
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
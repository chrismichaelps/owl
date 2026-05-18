State_ID: BigInt(0x08499f93c231a31f)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 08499f93c231a31f9c7dcccb14d911d2c67dd9817eb8d6bf351e6a4c1a198715
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Tokens.Pruning (src/tokens/pruning/index.ts)

### [Signatures]
- `estimateTokens(text: string) => number`
- `estimateMessageTokens(msg: Message) => number`
- `estimateConversationTokens(messages: readonly Message[]) => number`
- `extractMarkovWindow(messages: readonly Message[], windowSize: number) => readonly Message[]`
- `shouldPrune(currentTokens: number, budget: number) => boolean`
- `pruneMessages(messages: readonly Message[], options: PruneOptions) => Effect<PruneResult>`

### [Governance]
- depth_score: 0.77 — DEEP (Markov pruning algorithm, token estimation)
- seam_capacity: CRITICAL (token efficiency engine)
- leverage: HIGH (used by ContextManager for windowing)
- SIG_ID: SIG-tokens-pruning-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Imports: `@root/src/core/constants/index.js`, `@root/src/core/schema/index.js`

### [Architecture]
- Second-Order Markov context pruning engine
- Token estimation: ~4 chars per token (GPT/Claude heuristic)
- Markov invariant: V_{n+1} = f(V_n, V_{n-1}) — preserves last 2 exchange pairs
- pruneMessages: prune then truncate to fit budget
- preserveSystemPrompt option for system message retention

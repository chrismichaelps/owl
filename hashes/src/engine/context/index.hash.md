State_ID: BigInt(0x0000000000000015)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 01ce5c6ee02c857ee2fbe289e181697944a938a1091208b5ed6692b5533bed2d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Context (src/engine/context/index.ts)

### [Signatures]
- `ContextManager: Context.Tag<ContextManager, ContextManagerService>`
- `ContextManagerLive: Layer.effect<ContextManager, ContextManagerService>`
- `addMessage(msg: Message) => Effect<void>`
- `getMessages() => Effect<readonly Message[]>`
- `getWindowedMessages(budget: number) => Effect<readonly Message[]>`
- `setSystemPrompt(prompt: string) => Effect<void>`
- `getSystemPrompt() => Effect<string | undefined>`
- `estimateTokens() => Effect<number>`
- `clear() => Effect<void>`

### [Governance]
- depth_score: 0.72 — DEEP (pruning integration, token estimation)
- seam_capacity: CRITICAL (integrates with tokens/pruning)
- leverage: HIGH (used by Orchestrator for context management)
- SIG_ID: SIG-engine-context-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/orchestrator/index.hash.md`
- Imports: `@root/src/tokens/pruning/index.js`, `@root/src/core/schema/index.js`

### [Architecture]
- Pruning-aware conversation context window manager
- Holds messages in Effect Ref, exposes add/get/window/clear/estimateTokens
- Integrates with tokens/pruning to apply Second-Order Markov pruning when context window fills
- System prompt support for LLM instructions
- Token estimation via character-length heuristic (~4 chars/token)

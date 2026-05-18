State_ID: BigInt(0x8226761f488a0a2f)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 8226761f488a0a2f98f4e807a1c54d548a52017efbb7d563aff13840073c8505
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

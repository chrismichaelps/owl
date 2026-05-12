---
State_ID: BigInt(0x0000000000000037)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.OpenAI (src/providers/openai/index.ts)

### [Signatures]
- `OPENAI_CAPABILITIES` — gpt-4o ($2.50/$10), o3 ($2/$8)
- `OpenAIAdapter extends Context.Tag` — OpenAI-compatible provider
- `OpenAIAdapterLive: Layer` — production-ready adapter with retry logic

### [Governance]
- depth_score: 0.75 — DEEP (SDK integration + retry logic)
- seam_capacity: CRITICAL
- SIG_ID: SIG-providers-openai-00000001

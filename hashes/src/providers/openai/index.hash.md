---
State_ID: BigInt(0x0000000000000021)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 527530f12c9e74bd5731d8e0bc3129e476519c3c510d3ffee10d15385e45bee0
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
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

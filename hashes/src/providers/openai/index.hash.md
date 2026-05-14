State_ID: BigInt(0x0000000000000021)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: a9ace3026aa3ab3073ea99f0f11039ef6d15df802d93f1a64a3a57bd749f6d3b
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

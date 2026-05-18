State_ID: BigInt(0x46ae0caaa48bbd0c)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 46ae0caaa48bbd0c1751ee23beddf87f7676e54ccf6df1594476fac68977620b
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Providers.OpenAI (src/providers/openai/index.ts)

### [Signatures]
- `OPENAI_CAPABILITIES` — gpt-4o ($2.50/$10), o3 ($2/$8)
- `OpenAIAdapter extends Context.Tag` — OpenAI-compatible provider
- `OpenAIAdapterLive: Layer` — production adapter with inert unconfigured state and retry logic

### [Governance]
- depth_score: 0.77 — DEEP (SDK integration + optional Provider startup safety)
- seam_capacity: CRITICAL
- SIG_ID: SIG-providers-openai-00000001

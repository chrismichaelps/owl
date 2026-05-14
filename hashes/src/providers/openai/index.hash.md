State_ID: BigInt(0x000000000000005a)
Git_SHA: 06df5791bfbe5a97aa4216e8ece760e7ee760895
Source_SHA256: 1cbb9cd4cf59ba0ac4f6215d21f53a09d05299228b50a94fd593eece3db6938e
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

---
State_ID: BigInt(0x0000000000000020)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: a751fc2eb9180a7ccdf77b20a7cd09d7a29c134ad87f4139d27efdf5dfc44f52
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Anthropic (src/providers/anthropic/index.ts)

### [Signatures]
- `ANTHROPIC_CAPABILITIES` — claude-opus-4-7 (1M ctx), claude-sonnet-4-6, claude-haiku-4-5 (vision enabled)
- `AnthropicAdapter extends Context.Tag` — primary reasoning provider
- `AnthropicAdapterLive: Layer` — updated with explicit Promise returns and removed type assertions

### [Governance]
- depth_score: 0.82 — DEEP (SDK integration + improved type safety + explicit error mapping)
- seam_capacity: CRITICAL
- SIG_ID: SIG-providers-anthropic-00000001

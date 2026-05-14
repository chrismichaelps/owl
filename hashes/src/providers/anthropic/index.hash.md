State_ID: BigInt(0x0000000000000020)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 745696a5d9cabe189505f3a80dd065ae9a72ff6032c43fdd9cee5d220c3a5138
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

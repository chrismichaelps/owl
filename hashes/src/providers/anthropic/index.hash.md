---
State_ID: BigInt(0x0000000000000036)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
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

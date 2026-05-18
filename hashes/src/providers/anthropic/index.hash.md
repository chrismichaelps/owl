State_ID: BigInt(0x8d07f19bd1438d11)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 8d07f19bd1438d111c88d1ba9fbe24ce39c9a691af8fe8b2e1ef7a5362ec96a5
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Providers.Anthropic (src/providers/anthropic/index.ts)

### [Signatures]
- `ANTHROPIC_CAPABILITIES` — claude-opus-4-7 (1M ctx), claude-sonnet-4-6, claude-haiku-4-5 (vision enabled)
- `AnthropicAdapter extends Context.Tag` — primary reasoning provider
- `AnthropicAdapterLive: Layer` — complete and stream support prompt cache_control and cache token mapping

### [Governance]
- depth_score: 0.84 — DEEP (SDK integration + prompt caching + explicit error mapping)
- seam_capacity: CRITICAL
- SIG_ID: SIG-providers-anthropic-00000001

### [Architecture]
- `complete()` sends system prompt as content block array with `cache_control: { type: "ephemeral" }`.
- `complete()` maps `cache_creation_input_tokens` to `cacheWriteTokens`.
- `complete()` maps `cache_read_input_tokens` to `cacheReadTokens`.
- `stream()` emits usage StreamChunk from Anthropic SDK `message` event before end.

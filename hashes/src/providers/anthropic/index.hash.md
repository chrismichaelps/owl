State_ID: BigInt(0x000000000000006e)
Git_SHA: b08b51254f38dd6138e55dbe56ad187ff73866f5
Source_SHA256: 7db3b2b6d5a2141704240c7c43b65b6ba825ac5f3846acc13d84ab6b72415124
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

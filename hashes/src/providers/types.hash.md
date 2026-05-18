State_ID: BigInt(0x9e4b527f92b08251)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 9e4b527f92b08251816539a7ccd2d0c2c8f60ae93890b177219a680ac4f4ca90
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Providers.Types (src/providers/types.ts)

### [Signatures]
- `ProviderCapabilitySchema`, `RoutingContextSchema`, `StreamChunkSchema` — Schema definitions
- `StreamChunk` — text/thinking/tool/stop chunks plus usage cache token fields
- `LLMProviderService` — interface: id, capabilities, complete, stream, countTokens, healthCheck
- `LLMProvider extends Context.Tag` — service tag
- `RoutingDecisionSchema`, `AnyProviderError`
- `StreamingCallbackResult` — interface: content, provider, model, latencyMs, cacheReadTokens, cacheWriteTokens

### [Governance]
- depth_score: 0.70 — DEEP (BACKBONE contract shared by all adapters)
- seam_capacity: BACKBONE
- SIG_ID: SIG-providers-types-00000001

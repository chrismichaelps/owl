State_ID: BigInt(0x000000000000006f)
Git_SHA: b08b51254f38dd6138e55dbe56ad187ff73866f5
Source_SHA256: 3804231f7ef3fbd4209be25d85522f81e5b5012221dd98158ad629600b04a308
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

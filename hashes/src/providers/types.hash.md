State_ID: BigInt(0x0000000000000052)
Git_SHA: b20ee4c34893a44169b22184057fe5d51b2047d3
Source_SHA256: 9b29ab18b2d535348d311d8c2cf72468a9cc905c3fcb6f303d2af358e09d1917
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Types (src/providers/types.ts)

### [Signatures]
- `ProviderCapabilitySchema`, `RoutingContextSchema`, `StreamChunkSchema` — Schema definitions
- `LLMProviderService` — interface: id, capabilities, complete, stream, countTokens, healthCheck
- `LLMProvider extends Context.Tag` — service tag
- `RoutingDecisionSchema`, `AnyProviderError`
- `StreamingCallbackResult` — interface: content, provider, model, latencyMs (Phase 9 Streaming result)

### [Governance]
- depth_score: 0.70 — DEEP (BACKBONE contract shared by all adapters)
- seam_capacity: BACKBONE
- SIG_ID: SIG-providers-types-00000001

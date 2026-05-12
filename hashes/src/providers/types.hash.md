---
State_ID: BigInt(0x0000000000000030)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Types (src/providers/types.ts)

### [Signatures]
- `ProviderCapabilitySchema`, `RoutingContextSchema`, `StreamChunkSchema` — Schema definitions
- `LLMProviderService` — interface: id, capabilities, complete, stream, countTokens, healthCheck
- `LLMProvider extends Context.Tag` — service tag
- `RoutingDecisionSchema`, `AnyProviderError`

### [Governance]
- depth_score: 0.70 — DEEP (BACKBONE contract shared by all adapters)
- seam_capacity: BACKBONE
- SIG_ID: SIG-providers-types-00000001

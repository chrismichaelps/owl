State_ID: BigInt(0x0000000000000053)
Git_SHA: b20ee4c34893a44169b22184057fe5d51b2047d3
Source_SHA256: 78d991015ca9e978747665515f429c6fa1099edb02ae33d0e8f9f8cc366de45e
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Router (src/providers/router/index.ts)

### [Signatures]
- `ProviderRouterService` — route(ctx), complete(ctx, req), completeWithCallback(ctx, req, onChunk), listProviders()
- `ProviderRouter extends Context.Tag` — BACKBONE seam tag
- `ProviderRouterLive: Layer` — Ref-backed dynamic registry with _register escape hatch
- `registerProvider(router, provider): Effect<void>`

### [Governance]
- depth_score: 0.85 — DEEP (BACKBONE seam coordinator)
- seam_capacity: BACKBONE
- SIG_ID: SIG-providers-router-00000001

---
State_ID: BigInt(0x0000000000000025)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: f170fafe14c9d5a028a05db9761e546c84b70f45fd569662b22eda67ab274c87
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Router (src/providers/router/index.ts)

### [Signatures]
- `ProviderRouterService` — route(ctx), complete(ctx, req), listProviders()
- `ProviderRouter extends Context.Tag` — BACKBONE seam tag
- `ProviderRouterLive: Layer` — Ref-backed dynamic registry with _register escape hatch
- `registerProvider(router, provider): Effect<void>`

### [Governance]
- depth_score: 0.85 — DEEP (BACKBONE seam coordinator)
- seam_capacity: BACKBONE
- SIG_ID: SIG-providers-router-00000001

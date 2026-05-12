---
State_ID: BigInt(0x0000000000000032)
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

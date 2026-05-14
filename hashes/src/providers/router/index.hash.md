State_ID: BigInt(0x000000000000005e)
Git_SHA: f62c2f2f8df5bb172147a5ae827784dac4718a11
Source_SHA256: 9631280cf70e2dca03efd4113c7194669ee1c6c9ebbd7f04af1286ac5717894d
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
- depth_score: 0.88 — DEEP (BACKBONE seam coordinator with Provider failover)
- seam_capacity: BACKBONE
- SIG_ID: SIG-providers-router-00000001

### [Architecture]
- `route` returns the top ranked Provider plus bounded fallback Provider ids.
- `complete` attempts ranked Providers until one succeeds.
- `completeWithCallback` preserves live Streaming and only retries fallback before visible text is emitted.

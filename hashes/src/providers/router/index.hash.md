State_ID: BigInt(0x0000000000000070)
Git_SHA: b08b51254f38dd6138e55dbe56ad187ff73866f5
Source_SHA256: 08a60452e74a9716f9400afdffc4a8a05bb378f9a9f04c4da0ebc3bbb966ee38
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
- `completeWithCallback` captures usage StreamChunk cache tokens into StreamingCallbackResult.

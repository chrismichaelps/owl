State_ID: BigInt(0xb15059794218e887)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: b15059794218e887589e82f350adb191434dbb2a7d7a3fcd72b4abf89dca54ec
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

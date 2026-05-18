State_ID: BigInt(0x1a99148caf96c533)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 1a99148caf96c53324fe38ea601c6f78adb25bc8f973bf43750d149fbdd0e0c2
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Providers.Bootstrap (src/providers/bootstrap.ts)

### [Signatures]
- `ProviderBootstrapService` — startup evidence with registered Provider ids
- `ProviderBootstrap extends Context.Tag` — runtime initialization marker
- `ProviderBootstrapLive: Layer.effect` — registers configured Providers with ProviderRouter

### [Governance]
- depth_score: 0.78 — DEEP (centralized Provider registration)
- seam_capacity: BACKBONE
- leverage: HIGH
- locality: HIGH
- SIG_ID: SIG-providers-bootstrap-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/providers/router/index.hash.md`
- Imports: `@root/src/providers/router/index.ts`, `@root/src/core/config/index.ts`, Provider adapter Modules

### [Architecture]
- Centralizes Provider registration before Inference.
- Keeps CLI, TUI, CommandRegistry, and Orchestrator from knowing adapter registration details.
- Optional Providers are omitted from routing unless configured.

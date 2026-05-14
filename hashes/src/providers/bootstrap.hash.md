State_ID: BigInt(0x0000000000000058)
Git_SHA: 06df5791bfbe5a97aa4216e8ece760e7ee760895
Source_SHA256: 544a169167caa86b796a6d71401a6530ffc42044a385156ee0e7f57e72c12f02
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

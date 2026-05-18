State_ID: BigInt(0x679b628ccbc009a2)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 679b628ccbc009a23c60ae0ad30c7d20a8b321ef598bc061f350ed095671ea51
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Commands.Management.Providers (src/commands/management/providers.ts)

### [Signatures]
- `makeProvidersCommand(router, routingPreferences, name?) => CommandHandler`
- `formatProviderCapability(capability: ProviderCapability) => string`

### [Governance]
- depth_score: 0.58 — MEDIUM (Effect over router + preferences, display formatting)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-management-providers-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/providers/router/index.hash.md`, `@root/hashes/src/providers/preferences/index.hash.md`, `@root/hashes/src/providers/types.hash.md`, `@root/hashes/src/core/cost.hash.md`

### [Architecture]
- Lists registered provider models and routing capabilities
- Shows active preferred provider and per-model cost/context details
- formatProviderCapability is a pure string formatter — no side effects

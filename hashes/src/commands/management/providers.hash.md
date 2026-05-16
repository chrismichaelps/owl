State_ID: BigInt(0x0000000000000079)
Git_SHA: 0abcdef1234567890abcdef123456789abcdef01
Source_SHA256: 0abcdef1234567890abcdef123456789abcdef0123456789abcdef1234567890
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

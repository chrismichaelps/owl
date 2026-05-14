State_ID: BigInt(0x000000000000006c)
Git_SHA: 8a91a98ecac3bf6be3ffa105496ef48e08cc429b
Source_SHA256: db17dac1e99cbaf7598d66871b42689189b7cb70a08a96f4df267e753726627d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Registry (src/commands/registry.ts)

### [Signatures]
- `CommandRegistryService: { register, lookup, list, dispatch }`
- `CommandRegistry: Context.Tag<CommandRegistry, CommandRegistryService>`
- `buildRegistryService(mapRef: Ref.Ref<Map<string, CommandHandler>>) => CommandRegistryService`
- `makeCommandRegistryLive(projectRoot: string) => Layer<CommandRegistry, never, ... | UsageMetrics | RoutingPreferences>`

### [Governance]
- depth_score: 0.85 — DEEP (composition root with 20+ command handlers)
- seam_capacity: BACKBONE (central command dispatch hub)
- leverage: CRITICAL (orchestrates all command registration and dispatch)
- SIG_ID: SIG-cmd-registry-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: N/A (root command module)
- Deps: All command modules, all service layers

### [Architecture]
- Central command registry service with Ref-backed map
- Provides register, lookup, list, and dispatch operations
- buildRegistryService: factory for shared service logic
- CommandRegistryLive: bare registry with no pre-registered commands
- makeCommandRegistryLive: full composition root registering 20+ handlers
- Registers: Core (task, deep, quick, plan), Power (raw, god, economy), Analysis (analyze, brain, seams, depth, friction, grill), Editing (edit, inject, create, refactor, diff, apply, undo), Management (role, registry, audit, status, clear, memory, model)
- Injects shared UsageMetrics into `/status`.
- Injects shared RoutingPreferences into `/model`.

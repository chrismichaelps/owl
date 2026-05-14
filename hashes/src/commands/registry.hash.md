State_ID: BigInt(0x0000000000000064)
Git_SHA: 1cd37ce367ad7a684a8a32d7049f5f665e95a599
Source_SHA256: c3e124063de9ea9f86b0633fd686546c759328339a0393bff5edc7336948bb89
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Registry (src/commands/registry.ts)

### [Signatures]
- `CommandRegistryService: { register, lookup, list, dispatch }`
- `CommandRegistry: Context.Tag<CommandRegistry, CommandRegistryService>`
- `buildRegistryService(mapRef: Ref.Ref<Map<string, CommandHandler>>) => CommandRegistryService`
- `makeCommandRegistryLive(projectRoot: string) => Layer<CommandRegistry, never, ... | RoutingPreferences>`

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
- Injects shared RoutingPreferences into `/model`.

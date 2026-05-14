State_ID: BigInt(0x000000000000006C)
Git_SHA: 4fb75cc914649de6888fe13d592beb4cd5666faa
Source_SHA256: fd22cd1815f98e1b703d42697b1fc4e491b9efbee0a58081c283fbfd955a99d8
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Registry (src/commands/registry.ts)

### [Signatures]
- `CommandRegistryService: { register, lookup, list, dispatch }`
- `CommandRegistry: Context.Tag<CommandRegistry, CommandRegistryService>`
- `buildRegistryService(mapRef: Ref.Ref<Map<string, CommandHandler>>) => CommandRegistryService`
- `makeCommandRegistryLive(projectRoot: string) => Layer<CommandRegistry, never, ...>`

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
- makeCommandRegistryLive: full composition root registering 20 handlers
- Registers: Core (task, deep, quick, plan), Power (raw, god, economy), Analysis (analyze, brain, seams, depth, friction, grill), Editing (edit, inject, create, refactor, diff, apply, undo), Management (role, registry, audit, status, clear, memory, model)

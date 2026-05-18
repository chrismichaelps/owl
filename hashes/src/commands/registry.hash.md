State_ID: BigInt(0x1d2a18ad01c2d7be)
Git_SHA: d3c6a7c5049212a7869cdca8b4988e784a0a45b0
Source_SHA256: 1d2a18ad01c2d7bedd65b1e078a6aad7346ff3e4ff21e8d3ab524c23770c7d0d
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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
- SIG_ID: SIG-cmd-registry-1d2a18ad

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
- Injects shared ToolPermissionState into `/permissions` and `/tools`.

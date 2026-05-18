---
Module: @root/src/commands/management/doctor.ts
State_ID: BigInt(0x0000000000000000)
---

# Logic Blueprint: @Owl.Commands.Management.Doctor src/commands/management/doctor.ts

## Algorithm

1. Read ProviderRouter capabilities, health, and reliability through public inspection methods.
2. Read MCP server statuses through McpManager.
3. Read built-in tool descriptors through BuiltInTools.
4. Read Session turns from SessionMemory and runtime totals from UsageMetrics.
5. Read ContextCache saved-token total from ContextCache.
6. Format each RuntimeDiagnostic section as deterministic plain text:
   - Providers
   - MCP servers
   - Tools
   - Session
   - Context cache
   - Warnings
7. Return a CommandResult with no side effects.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: trigger Orchestrator or Provider Inference.
- MUST NOT: inspect Provider adapter internals directly.
- MUST NOT: read `process.env`; configuration visibility must come from registered services.
- MUST NOT: mutate any runtime service while diagnosing it.
- MUST NOT: hide disconnected MCP servers or unhealthy Providers.

## Edge Cases

- **No Providers registered**: report a warning and keep the command successful.
- **No MCP servers configured**: report "none" instead of failing.
- **No tools visible**: report zero visible tools and continue.
- **No Session turns**: report zero turns and zero Session tokens.
- **No ContextCache entries**: report zero saved Tokens.

## Dependencies

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/factory.hash.md`
- Domain: `docs/CONTEXT.md#RuntimeDiagnostic`

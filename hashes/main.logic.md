# Logic Blueprint: @Owl.Entry (src/main.ts)

## State Machine

| State | Transition | Guard |
|-------|------------|-------|
| BOOT_IDLE | parseCLIArgs | argv.valid |
| BOOT_LOADING_MCP | loadMcpConfig | config.parsed |
| BOOT_BUILDING_LAYERS | buildRuntime | layers.ready |
| BOOT_MOUNTING_TUI | mountInkApp | runtime.initialized |
| BOOT_ACTIVE | waitUntilExit | tui.running |
| BOOT_TEARDOWN | disposeRuntime | exit.requested |
| BOOT_ERROR | handleFatalError | error != null |

## Algorithm

1. **ParseArgs** — Parse CLI argv via cli/args.ts into { mode, prompt, projectRoot }
2. **LoadMCP** — Call loadMcpConfig(projectRoot) — merges global + project MCP server configs
3. **BuildRuntime** — Construct Effect runtime with all service layers (providers, orchestrator, memory, context, MCP manager)
4. **MountTUI** — Render App component via Ink with resolved runtime and initial mode/prompt
5. **WaitExit** — Block on waitUntilExit() — Ink drives all user interaction until Ctrl+C or /quit
6. **Dispose** — Call runtime.dispose() in finally block — always executes even on error
7. **ErrorBoundary** — bootCli wraps runCli; fatal errors formatted by formatFatalError and written to stderr before exit(1)

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Put business logic in src/main.ts — delegate to cli/run.ts
- MUST NOT: Use console.log directly — use logging layer
- MUST NOT: Skip runtime.dispose() — always runs in finally block
- MUST NOT: Throw from bootCli — catch all, format, exit(1)

## Edge Cases

- **Missing config**: loadMcpConfig returns empty config — no servers registered
- **MCP server failure**: Individual server connection failures are non-fatal — skipped with status.connected=false
- **Runtime panic**: Caught in bootCli → formatFatalError → stderr → exit(1)
- **TUI crash**: Ink renders error boundary — waitUntilExit rejects → caught by runCli

## Registry State (Phase 1 Complete)

- Total source modules: 116
- Total hash registry files: 348 (116 × 3 = .hash.md + .logic.md + .contract.json)
- Total local.map.json nodes: 52
- State_ID: BigInt(0x00000000000000a5)
- Mirror completeness: VERIFIED — zero gaps

## Dependencies

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`

---

*Updated by FMCF Forensic Guardian — 2026-05-16T15:52:00Z*
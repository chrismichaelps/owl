---
State_ID: BigInt(0x00000000000000a5)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: 7d3876cbd574c9d43a9f56765e7b438ea6d9b212e5a3e21a5be9272a8f92ca74
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
Registry_Nodes: 52
Registry_Hash_Files: 348
Registry_Src_Modules: 116
Registry_Updated: 2026-05-16T15:51:00Z
---

## @Owl.Entry (src/main.ts)

### [Signatures]
- `main: Effect<void, never, never>` — synchronous Effect that logs startup message
- Entry: `Effect.runSync(main)`

### [Governance]
- Module: `@root/src/main.ts`
- Role: CLI entry point — smoke-test target for Phase 0 bootstrap
- Fidelity: Active
- SIG_ID: SIG-main-44a17ae7

### [Semantic Hash]
- Source SHA256: b31cb8764054852270b7e5388e8403f3b248298a263670b5ee5cd95c0eba2764
- Verified: 2026-05-12 — [TEST: PASSED] — dist/main.js emits "Owl — AI coding agent"

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/local.map.json`

### [Architecture]
- depth_score: 0.10
- depth_status: SHALLOW (intentional — entry point, not a business module)
- seam_capacity: INTERNAL
- leverage: LOW
- locality: HIGH
- notes: Phase 0 bootstrap entry point. Phase 1 full CLI layer complete — 116 modules registered.

### [Registry Coverage]
- cli/: help, run (2 modules)
- commands/editing/: add (1 module — add.ts)
- commands/management/: compact, export, help, history, init, mcp, providers (7 modules)
- commands/utils/: ids, prompt (2 modules)
- core/: cost, path (2 modules)
- engine/context/: projectContext, systemPrompt (2 modules)
- engine/memory/: persistence, schema (2 modules)
- mcp/: config, index, manager (3 modules)
- providers/: cost, image (2 modules)
- tui/commands/: fuzzy (1 module)
- tui/components/: AgentPipeline, CommandPalette, FileMentionPalette, MarkdownText, ShortcutsOverlay, WelcomePanel (6 modules)
- tui/history/: index (1 module)
- tui/hooks/: useScrollableList, useTerminalAnimation (2 modules)
- tui/mentions/: files, index (2 modules)

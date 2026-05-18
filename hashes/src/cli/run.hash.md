State_ID: BigInt(0xe3b99f886fa8808c)
Git_SHA: 28016da38e6a87f9459ea519185c945fd6d89187
Source_SHA256: e3b99f886fa8808cee7ba258a56ff601f4156435a1ddbfd1228ea991759bfb46
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE

---

## @Owl.CLI.Runner (src/cli/run.ts)

### [Signatures]

- `runCli(argv, projectRoot) => Promise<void>`
- `bootCli(argv?, projectRoot?) => void`

### [Governance]

- depth_score: 0.58 — MEDIUM (async orchestration, process lifecycle)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-cli-run-e3b99f88

### [Linkage]

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/mcp/config.hash.md`, `@root/hashes/src/mcp/manager.hash.md`

### [Architecture]

- Main CLI async entrypoint — parses args, builds runtime, mounts TUI
- Passes startup Permission mode and Provider override to the App before initial prompt execution
- bootCli wraps runCli in a process-level error boundary
- Orchestrates MCP layer init before handing off to Ink renderer

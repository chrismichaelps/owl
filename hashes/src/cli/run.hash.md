State_ID: BigInt(0xdcff6c7acbd92e64)
Git_SHA: f1b13413fd4d8ec3343ed363319d201316149bc6
Source_SHA256: dcff6c7acbd92e64c224628cd322dcaef8ad30e47b69e68954eac7e5322ecab5
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:29:56Z

---

## @Owl.CLI.Runner (src/cli/run.ts)

### [Signatures]

- `runCli(argv, projectRoot) => Promise<void>`
- `bootCli(argv?, projectRoot?) => void`

### [Governance]

- depth_score: 0.58 — MEDIUM (async orchestration, process lifecycle)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-cli-run-dcff6c7a

### [Linkage]

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/mcp/config.hash.md`, `@root/hashes/src/mcp/manager.hash.md`

### [Architecture]

- Main CLI async entrypoint — parses args, builds runtime, mounts TUI
- Passes startup Permission mode, Privacy mode, Session resume id, and Provider override to the App before initial prompt execution
- bootCli wraps runCli in a process-level error boundary
- Orchestrates MCP layer init before handing off to Ink renderer

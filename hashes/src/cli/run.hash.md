State_ID: BigInt(0xbffbf92cf835c187)
Git_SHA: 290d9fe3c5c3311e78b1ee35bc6206ea32ffe2b5
Source_SHA256: bffbf92cf835c187ec83c8504a36f27bb29a30c70db0472adbe820e6540657a3
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
- SIG_ID: SIG-cli-run-bffbf92c

### [Linkage]

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/mcp/config.hash.md`, `@root/hashes/src/mcp/manager.hash.md`

### [Architecture]

- Main CLI async entrypoint — parses args, builds runtime, mounts TUI
- Passes startup Permission mode, Privacy mode, and Provider override to the App before initial prompt execution
- bootCli wraps runCli in a process-level error boundary
- Orchestrates MCP layer init before handing off to Ink renderer

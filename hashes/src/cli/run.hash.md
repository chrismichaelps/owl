State_ID: BigInt(0x0000000000000071)
Git_SHA: b2c3d4e5f67890abcdef1234567890abcdef1234
Source_SHA256: b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890ab
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.CLI.Runner (src/cli/run.ts)

### [Signatures]
- `runCli(argv, projectRoot) => Promise<void>`
- `bootCli(argv?, projectRoot?) => void`

### [Governance]
- depth_score: 0.58 — MEDIUM (async orchestration, process lifecycle)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-cli-run-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/mcp/config.hash.md`, `@root/hashes/src/mcp/manager.hash.md`

### [Architecture]
- Main CLI async entrypoint — parses args, builds runtime, mounts TUI
- bootCli wraps runCli in a process-level error boundary
- Orchestrates MCP layer init before handing off to Ink renderer

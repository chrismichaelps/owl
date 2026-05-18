State_ID: BigInt(0x6a4d58941e282dd7)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 6a4d58941e282dd7521e7b1472c0b5e8fe8a582d75689e6ec89e5190599cf0e3
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

State_ID: BigInt(0x3d57291f8deba52f)
Git_SHA: f47cd6855f93081e4222c7b3c31dc9b4151717f5
Source_SHA256: 3d57291f8deba52fb55fd55562ae3451e3bf66444b1c01efb45841b94ec2c771
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
- SIG_ID: SIG-cli-run-3d57291f

### [Linkage]

- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/cli/index.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`, `@root/hashes/src/mcp/config.hash.md`, `@root/hashes/src/mcp/manager.hash.md`

### [Architecture]

- Main CLI async entrypoint — parses args, builds runtime, mounts TUI
- Passes startup Permission mode to the App before initial prompt execution
- bootCli wraps runCli in a process-level error boundary
- Orchestrates MCP layer init before handing off to Ink renderer

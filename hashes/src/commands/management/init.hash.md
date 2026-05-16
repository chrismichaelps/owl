State_ID: BigInt(0x0000000000000077)
Git_SHA: 890abcdef1234567890abcdef123456789abcdef
Source_SHA256: 890abcdef1234567890abcdef123456789abcdef01234567890abcdef1234567
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Init (src/commands/management/init.ts)

### [Signatures]
- `makeInitCommand(projectRoot: string) => CommandHandler`

### [Governance]
- depth_score: 0.58 — MEDIUM (async I/O for scaffold generation)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-management-init-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/core/constants/index.hash.md`

### [Architecture]
- Scaffolds CLAUDE.md and .owl/ directory in project root
- Idempotent — skips files that already exist
- Reports created vs skipped files in output

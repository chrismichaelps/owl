State_ID: BigInt(0x585b5efd28467074)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 585b5efd28467074258e87afef8dd6203fc5583915fe96148cc35f77d4f81237
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

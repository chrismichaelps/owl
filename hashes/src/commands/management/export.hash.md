State_ID: BigInt(0x0000000000000074)
Git_SHA: e5f67890abcdef1234567890abcdef123456789a
Source_SHA256: e5f67890abcdef1234567890abcdef123456789012345678901234567890abcd
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Commands.Management.Export (src/commands/management/export.ts)

### [Signatures]
- `makeExportCommand(sessionMemory, projectRoot) => CommandHandler`

### [Governance]
- depth_score: 0.55 — MEDIUM (I/O effect over session turns)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-cmd-management-export-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/commands/registry.hash.md`
- Deps: `@root/hashes/src/engine/memory/index.hash.md`

### [Architecture]
- Writes all session turns to a markdown file in project root
- Auto-generates filename with timestamp if none provided
- Each turn rendered as headed section with prompt and response

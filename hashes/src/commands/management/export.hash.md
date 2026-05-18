State_ID: BigInt(0x8adf91179dbd88c1)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 8adf91179dbd88c1ccb412dcdfe77f554e6a886389582789ef1524c83d1e0dfc
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

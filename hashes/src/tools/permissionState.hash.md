State_ID: BigInt(0x03c01ae9dd701d38)
Git_SHA: 17c4050cfdac862684e6092f1faff2daa7394d47
Source_SHA256: 03c01ae9dd701d389bd2df81f737d32fb41fe5312b66903a141c6404a3860a87
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:38:00Z

---

## @Owl.Tools.PermissionState (src/tools/permissionState.ts)

### [Signatures]

- `getMode() => Effect<ToolPermissionMode>`
- `setMode(mode: ToolPermissionMode) => Effect<void>`
- `snapshot() => Effect<ToolPermissionSnapshot>`
- `makeToolPermissionStateService() => Effect<ToolPermissionStateService>`
- `parseToolPermissionMode(value: string) => Option<ToolPermissionMode>`

### [Governance]

- depth_score: 0.72
- depth_status: DEEP
- seam_capacity: CRITICAL
- SIG_ID: SIG-tools-permission-state-03c01ae9

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Domain: `docs/CONTEXT.md#Permission`
- Dependency: `@root/hashes/src/tools/permission.hash.md`
- Dependency: `@root/hashes/src/core/constants/tools.hash.md`

### [Architecture]

- Session-local Permission mode state.
- Ref-backed Effect service.
- Exposes Chunk and Data.struct snapshots.

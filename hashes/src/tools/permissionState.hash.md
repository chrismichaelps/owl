State_ID: BigInt(0xd67a0026e7ee24e8)
Git_SHA: d3c6a7c5049212a7869cdca8b4988e784a0a45b0
Source_SHA256: d67a0026e7ee24e8ef1dbba0d2e8a0e6c6549c0d8eab94dc7846bb2676ccf185
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
Registry_Sync: 2026-05-18T03:05:00Z

---

## @Owl.Tools.PermissionState (src/tools/permissionState.ts)

### [Signatures]

- `getMode() => Effect<ToolPermissionMode>`
- `setMode(mode: ToolPermissionMode) => Effect<void>`
- `snapshot() => Effect<ToolPermissionSnapshot>`
- `parseToolPermissionMode(value: string) => Option<ToolPermissionMode>`

### [Governance]

- depth_score: 0.72
- depth_status: DEEP
- seam_capacity: CRITICAL
- SIG_ID: SIG-tools-permission-state-d67a0026

### [Linkage]

- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Domain: `docs/CONTEXT.md#Permission`
- Dependency: `@root/hashes/src/tools/permission.hash.md`
- Dependency: `@root/hashes/src/core/constants/tools.hash.md`

### [Architecture]

- Session-local Permission mode state.
- Ref-backed Effect service.
- Exposes Chunk and Data.struct snapshots.

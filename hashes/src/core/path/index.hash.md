State_ID: BigInt(0x0000000000000083)
Git_SHA: def1234567890abcdef1234567890abcdef12345
Source_SHA256: def1234567890abcdef1234567890abcdef123456789012345678901234567890
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Core.Path (src/core/path/index.ts)

### [Signatures]
- `resolveProjectPath(projectRoot, filePath, stage) => Effect<string, MutationError>`

### [Governance]
- depth_score: 0.80 — DEEP (path containment logic hidden behind 1-function interface)
- seam_capacity: CRITICAL
- leverage: HIGH
- SIG_ID: SIG-core-path-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/core/constants/index.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Enforces project-root containment — absolute paths and path escapes are rejected
- Returns resolved absolute path or MutationError via Effect
- All mutation-capable code must route through this — it is the path seam
- stage parameter localizes errors to the calling pipeline stage

---
State_ID: BigInt(0x000000000000001B)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: c5403f04c7f7aa5898f839fec029735d4d1c45927085693c49eff73856840bdb
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.FMCF.Registry (src/fmcf/registry/index.ts)

### [Signatures]
- `HashRegistry: Context.Tag<HashRegistry, HashRegistryService>`
- `HashRegistryLive(registryRoot: string) => Layer<HashRegistry, HashRegistryService>`
- `readSubsystems() => Effect<readonly SubsystemEntry[], HashRegistryError>`
- `readSeams() => Effect<readonly SeamEntry[], HashRegistryError>`
- `hasMirror(srcRelativePath: string) => Effect<boolean, HashRegistryError>`

### [Governance]
- depth_score: 0.73 — DEEP (file I/O, JSON parsing, path resolution)
- seam_capacity: BACKBONE (reads /hashes/ brain)
- leverage: HIGH (foundational for registry-driven governance)
- SIG_ID: SIG-fmcf-registry-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/fmcf/governance/index.hash.md`
- Imports: `@root/src/core/errors/index.js`

### [Architecture]
- Hash Registry reader for the /hashes/ brain
- Reads subsystems.json and seams.json
- Checks for .hash.md mirror existence via hasMirror
- Uses @effect/platform for FileSystem abstraction
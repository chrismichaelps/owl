State_ID: BigInt(0x94f1abd330c1fafd)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 94f1abd330c1fafdec372e228282b3844e00e17d90da058c187e8087389e9c39
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

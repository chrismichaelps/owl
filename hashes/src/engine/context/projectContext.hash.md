State_ID: BigInt(0x454233d144ad41e5)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 454233d144ad41e5e5e2e4aa484129254ecce4433eaf8f7964023c520fed32d0
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.Engine.Context.ProjectContext (src/engine/context/projectContext.ts)

### [Signatures]
- `loadProjectContext(projectRoot: string) => Effect<ProjectContext>`
- `ProjectContext: { claudeMd, gitStatus, projectRoot }`

### [Governance]
- depth_score: 0.62 — MEDIUM (Effect composition over 2 async I/O sources)
- seam_capacity: INTERNAL
- leverage: MEDIUM
- SIG_ID: SIG-engine-ctx-projctx-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/effect/effect.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Deps: `@root/hashes/src/core/errors/index.hash.md`

### [Architecture]
- Loads CLAUDE.md instructions and git status in parallel
- Composes both into a ProjectContext Data.struct
- Git failures are silenced — context degrades gracefully without git

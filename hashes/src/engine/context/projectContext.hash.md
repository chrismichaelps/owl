State_ID: BigInt(0x0000000000000084)
Git_SHA: ef1234567890abcdef1234567890abcdef123456
Source_SHA256: ef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
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

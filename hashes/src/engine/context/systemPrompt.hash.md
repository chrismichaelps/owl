State_ID: BigInt(0x0000000000000057)
Git_SHA: 695c5f2d1abff2c7b2db1bdd2f54e72b44c1839d
Source_SHA256: 6e2ca2879456572da4d65d03d2f341593c0b466f2a7a079fec741a279a851879
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Engine.Context.SystemPrompt (src/engine/context/systemPrompt.ts)

### [Signatures]
- `buildFMCFSystemPrompt() => string`

### [Governance]
- depth_score: 0.62 — MEDIUM (pure function, no hiding — but encapsulates governance contract text)
- seam_capacity: INTERNAL (within engine subsystem, used only by OrchestratorLive)
- leverage: MEDIUM (governs every Inference by establishing FMCF rules in the LLM context)
- SIG_ID: SIG-engine-sysprompt-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/engine/context/index.hash.md`
- Used by: `@root/hashes/src/engine/orchestrator/index.hash.md`

### [Architecture]
- Pure function — no side effects, no I/O, no Effect dependency
- Generates FMCF v3.5 system prompt injected at every Session start
- Called once in OrchestratorLive via ctx.setSystemPrompt(buildFMCFSystemPrompt())
- Encodes: Core Laws, Domain Vocabulary (CONTEXT.md), Depth Principle (LANGUAGE.md)

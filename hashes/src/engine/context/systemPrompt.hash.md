State_ID: BigInt(0xb4d2ce92328a3f5b)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: b4d2ce92328a3f5b65b09e3ffbfc5bc7d7ff88ed2eeb6791b59e66cbf54dabb5
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

---
State_ID: BigInt(0x000000000000003a)
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Ollama (src/providers/ollama/index.ts)

### [Signatures]
- `OLLAMA_CAPABILITIES` — llama3.2, codellama (16k ctx)
- `OllamaAdapter extends Context.Tag` — local inference provider
- `OllamaAdapterLive: Layer` — fetch-based local API integration

### [Governance]
- depth_score: 0.65 — MEDIUM (graceful local fallback)
- seam_capacity: CRITICAL
- SIG_ID: SIG-providers-ollama-00000001

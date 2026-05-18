State_ID: BigInt(0x7be152408bedd597)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 7be152408bedd597c230ed606f64552f88009f6acc792d5fb8955030eff07e88
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

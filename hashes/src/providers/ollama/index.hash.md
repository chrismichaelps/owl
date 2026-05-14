State_ID: BigInt(0x0000000000000024)
Git_SHA: ad091135d8d9083717a044f82e0307e4c2defb32
Source_SHA256: a29f05e15cf808df5450113972f7991fb47680a8ba9459c4031119cef9be40ad
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
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

# Logic Blueprint: @Owl.Providers.Bootstrap src/providers/bootstrap.ts

## Algorithm

1. Resolve the ProviderRouter, OWL_CONFIG, and every Provider adapter from the Effect context.
2. Register the Anthropic Provider with ProviderRouter because it is the primary required Provider for Inference.
3. Register the OpenAI Provider only when `openaiApiKey` is configured.
4. Register the Google Provider only when `googleApiKey` is configured.
5. Register the xAI Provider only when `xaiApiKey` is configured.
6. Register the Ollama Provider because it is local and does not require an API key.
7. Return a marker service so dependent Layers can force bootstrap completion before Orchestrator startup.

## Negative Logic (PROHIBITED PATHS)

- MUST NOT: Perform health checks or API calls during bootstrap; startup must only register adapter Interfaces.
- MUST NOT: Register optional Providers without credentials; routing would select Providers that cannot satisfy Inference.
- MUST NOT: Duplicate Provider registration from CLI, TUI, Orchestrator, or CommandRegistry.
- MUST NOT: Leak adapter construction details across the ProviderRouter Seam.

## Edge Cases

- **Missing optional API key**: Skip that Provider registration and keep runtime startup successful.
- **Missing Anthropic API key**: OWL_CONFIG fails before bootstrap, preserving the required Provider invariant.
- **Ollama unavailable**: Registration still succeeds; actual connectivity is checked by Provider health and Inference paths.

## Dependencies

- Grammar: "@root/hashes/grammar/effect/effect.hash.md"
- Domain: "@root/docs/CONTEXT.md#Provider"
- Language: "@root/hashes/LANGUAGE.md#Seam"
- Parent: "@root/hashes/src/providers/router/index.hash.md"

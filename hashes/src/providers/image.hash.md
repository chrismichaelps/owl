State_ID: BigInt(0x0000000000000094)
Git_SHA: e5f4a3b2a1b0c9d8
Source_SHA256: e5f4a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
---

## @Owl.Providers.Image (src/providers/image.ts)

### [Signatures]
- `hasImageTags(content: string) => boolean`
- `parseImageBlocks(content: string) => AnthropicContentBlock[] | null`

### [Governance]
- depth_score: 0.75 — DEEP (regex parsing + block assembly hidden behind 2-function interface)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-providers-image-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/providers/anthropic/index.hash.md`

### [Architecture]
- Parses owl:image tags emitted by tui/mentions into Anthropic vision blocks
- hasImageTags is a cheap pre-check before the full parse
- Returns null when no image tags present — caller uses plain string content
- OWL_IMAGE_TAG regex must be reset (lastIndex=0) before each parse call

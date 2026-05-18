State_ID: BigInt(0x35c4fc0f5dae2cf8)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 35c4fc0f5dae2cf8f79fcee335039b8b87fe3786120d7f7b0dc4198b08ab2939
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
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

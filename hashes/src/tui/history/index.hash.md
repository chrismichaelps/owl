State_ID: BigInt(0x7ab9962ef28626ec)
Git_SHA: 394e2dc49d8e980117dfaf68a4f26f18687d41c2
Source_SHA256: 7ab9962ef28626ec009dd23375d4a29abe597fcd098823f5837bb967f15d5420
Grammar_Lock: "@root/hashes/grammar/effect/effect.hash.md"
Fidelity: ACTIVE
---

## @Owl.TUI.History (src/tui/history/index.ts)

### [Signatures]
- `loadHistory(projectRoot: string) => Promise<string[]>`
- `appendHistory(prompt: string, projectRoot: string) => void`

### [Governance]
- depth_score: 0.74 — DEEP (JSONL append-only persistence hidden behind 2-function surface)
- seam_capacity: INTERNAL
- leverage: HIGH
- SIG_ID: SIG-tui-history-00000001

### [Linkage]
- Grammar: `@root/hashes/grammar/typescript/typescript.hash.md`
- Parent: `@root/hashes/src/tui/app.hash.md`

### [Architecture]
- Persists to ~/.owl/history.jsonl in append-only JSONL format
- loadHistory is project-scoped — filters by projectRoot path
- appendHistory is fire-and-forget — never blocks the user, never throws
- Deduplicates consecutive identical prompts during load
- MAX_HISTORY=200 entries returned newest-first

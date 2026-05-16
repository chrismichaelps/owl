State_ID: BigInt(0x0000000000000096)
Git_SHA: a3b2a1b0c9d8e7f6
Source_SHA256: a3b2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2a1b0c9d8e7f6a5b4c3d2
Grammar_Lock: "@root/hashes/grammar/typescript/typescript.hash.md"
Fidelity: DECLARED
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

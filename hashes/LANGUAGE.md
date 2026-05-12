---
Project: Owl
Last_Updated: 2026-05-12T15:00:00Z
---

# Owl Architecture Vocabulary

Canonical architecture term definitions. Grounded in Ousterhout's *A Philosophy of Software Design*. Both human and agent MUST use these terms exactly — no synonyms, no informal shorthand.

---

### Module
- **Definition:** Any unit that has an interface and an implementation — function, class, package, or tier-slice. The unit of depth analysis. Scale-agnostic.
- **Canonical name:** Module
- **Not:** "Service" (reserved for network boundary), "Component" (reserved for TUI layer), "Helper" (anti-pattern)
- **Example:** ProviderRouter, TokenPruner, FMCFGovernanceEngine, EditingPipeline

---

### Interface
- **Definition:** Everything a caller must know to use the Module correctly. Includes types, method signatures, invariants, error modes, ordering constraints, configuration requirements, and side effects. If a caller needs to know it, it is part of the Interface.
- **Canonical name:** Interface
- **Not:** "API" (too narrow — API usually means signatures only), "contract" (contract is the formal record of the interface)
- **Example:** ProviderRouter interface — includes: route(task) signature, the invariant that task must have a non-empty prompt, error mode PROVIDER_UNAVAILABLE, and the side effect that telemetry is emitted.

---

### Implementation
- **Definition:** The body of code inside the Module that carries out the promises the Interface makes. Hidden from callers by design. If callers depend on it directly, the boundary has leaked.
- **Canonical name:** Implementation
- **Not:** "internals", "private code", "logic" — use Implementation
- **Example:** The scoring algorithm inside ProviderRouter is its Implementation. Callers depend only on route(task) — the scoring is hidden.

---

### Depth
- **Definition:** The ratio of behaviors a caller can exercise to the amount of Interface they must learn. A quality measure, not a size measure. A module with a large implementation but trivially mapped behavior is still shallow.
- **Canonical name:** Depth (or DEPTH_SCORE when referring to the computed metric)
- **Not:** "abstraction level" (too vague), "complexity" (complexity is a cost; Depth is a benefit)
- **Example:** TokenPruner is deep — one method prune(messages) hides the entire Markov window calculation and cache invalidation logic.

---

### Deep module
- **Definition:** Provides powerful functionality behind a simple Interface. High behavioral payoff per unit of learning cost. Small Interface, large and capable Implementation.
- **Canonical name:** Deep module
- **Not:** "well-abstracted", "clean code" — these are informal
- **Example:** EditingPipeline — one method execute(mutation) triggers all 7 stages, governance validation, and rollback registration. The caller learns one signature and gets deterministic mutation safety.

---

### Shallow module
- **Definition:** Complex Interface relative to the functionality it provides. The caller pays a high learning cost for little behavioral gain. The primary target of deepening.
- **Canonical name:** Shallow module
- **Not:** "bad code" (shallow is an architectural property, not a code quality judgment)
- **Example:** A CommandValidator that exposes parse(), validate(), normalize(), and sanitize() separately when a single parseAndValidate() would suffice — callers pay four-method learning cost for one behavior.

---

### Deepening
- **Definition:** The act of redesigning a Module's Interface to hide more Implementation behind a simpler surface — increasing the behavioral payoff per unit of Interface learned.
- **Canonical name:** Deepening
- **Not:** "refactoring" (too broad), "abstraction" (too vague)
- **Example:** Collapsing four separate ProviderRouter methods into one intelligent route(task) that selects provider, handles fallback, and tracks cost internally.

---

### Seam
- **Definition:** The location where an Interface lives; where behavior can change without editing callers. One adapter = hypothetical seam. Two adapters = real seam.
- **Canonical name:** Seam
- **Not:** "Boundary" (informal), "Interface" (the Interface lives at the Seam; the Seam is the location)
- **Example:** ProviderRouter Seam — AnthropicAdapter (prod), OpenAIAdapter (prod), OllamaAdapter (prod) = BACKBONE Seam (3 production adapters).

---

### Locality
- **Definition:** Bugs and changes concentrated in one place (good) vs. scattered across N callers (bad). Depth grants Locality because Implementation details are hidden — callers cannot depend on what they cannot see.
- **Canonical name:** Locality
- **Not:** "cohesion" (related but not identical), "isolation" (isolation is a testing term)
- **Example:** All provider retry logic concentrated in the AnthropicAdapter Implementation — a bug fix touches one file, not every call site.

---

### TLI (Targeted Line Injection)
- **Definition:** The Shadow role's surgical editing technique — line-specific diffs that avoid full-file rewrites, preserve structure, and minimize drift. The only permitted method of Implementation modification.
- **Canonical name:** TLI
- **Not:** "edit", "write", "patch" — TLI implies surgical precision and governance compliance
- **Example:** Inserting `const retrySchedule = Schedule.exponential("100 millis", 2)` at line 47 of a file without touching surrounding context.

---

### Grammar Shard
- **Definition:** The pinned, project-specific syntax reference file in /hashes/grammar/ that governs all code generation — prevents Linguistic Drift by anchoring the AI to exact library versions and prohibited patterns.
- **Canonical name:** Grammar Shard
- **Not:** "style guide", "linting rules", "conventions" — Grammar Shard is the FMCF constitutional law for syntax
- **Example:** @root/hashes/grammar/effect/effect.hash.md anchoring all Effect-TS syntax to v3.19.19.

---

### Hash Registry
- **Definition:** The /hashes/ directory as a whole — the dual-track brain of the system containing Grammar Shards, .hash.md files, .contract.json, .logic.md, seams.json, and all forensic records.
- **Canonical name:** Hash Registry (or Registry per docs/CONTEXT.md)
- **Not:** "hashes folder", "metadata directory", "registry folder"
- **Example:** The Hash Registry mirroring /src/ structure exactly: src/providers/anthropic/index.ts → hashes/src/providers/anthropic/index.hash.md

---

### BACKBONE seam
- **Definition:** A Seam with 2+ distinct production adapters AND high change frequency (>2 changes/quarter). Requires full Interface design, test adapter, and ADR. Deepen heavily.
- **Canonical name:** BACKBONE seam
- **Not:** "critical" (CRITICAL is a different classification), "core seam"
- **Example:** ProviderRouter → Provider adapters — Anthropic (prod) + OpenAI (prod) + Ollama (prod) = BACKBONE.

---

### CRITICAL seam
- **Definition:** A Seam with 1 production adapter on a core execution path where failure = system failure. Deepen moderately — clear Interface plus test adapter.
- **Canonical name:** CRITICAL seam
- **Not:** "important seam", "key boundary"
- **Example:** Engine → ProviderRouter — single routing path whose failure stops all task execution.

---

### EXPLORATORY seam
- **Definition:** A Seam with 1 adapter where variation is speculative — not yet confirmed to need a second adapter. Keep simple; collapse if no second adapter in 6 months.
- **Canonical name:** EXPLORATORY seam
- **Not:** "potential seam", "future seam"
- **Example:** A speculative CacheAdapter for context storage — only one implementation exists, no second confirmed.

---

### Shard Split
- **Definition:** The mandated decomposition of a file when a proposed change would touch >15% of its lines — a signal that the Module is doing too many things and must be separated.
- **Canonical name:** Shard Split
- **Not:** "file split", "refactor", "decomposition"
- **Example:** A proposed change to ProviderRouter touching 80 of 400 lines (20%) → Shard Split into ProviderScorer and ProviderFallback.

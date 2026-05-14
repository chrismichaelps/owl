---
Project: Owl
Last_Updated: 2026-05-12T15:00:00Z
---

# Owl Domain Glossary

Canonical business concept definitions. Every module name, seam name, and interface comment MUST use these terms exactly.

---

### Task
- **Definition:** A unit of developer intent submitted to Owl for execution — a natural language request paired with the code context in which it must be resolved.
- **Canonical name:** Task
- **Not:** "prompt", "query", "request", "job" — these are infrastructure terms; Task is the domain noun.
- **Seams:** Task → Engine (CRITICAL), Task → TokenBudget (INTERNAL)
- **Example:** "Refactor the PaymentService to use the new stripe adapter" submitted via /task command.

---

### Mutation
- **Definition:** A deterministic code change produced by the Shadow role — a precise, scoped alteration to one or more source files validated by FMCF governance before application.
- **Canonical name:** Mutation
- **Not:** "edit", "change", "patch", "modification" — these are informal; Mutation is the governed artifact.
- **Seams:** Mutation → EditingPipeline (BACKBONE), Mutation → Rollback (CRITICAL)
- **Example:** Inserting lines 45–52 into `src/providers/anthropic/index.ts` to add retry logic.

---

### Provider
- **Definition:** An external LLM service that Owl routes inference requests to — identified by name, capability profile, and pricing tier.
- **Canonical name:** Provider
- **Not:** "model", "API", "backend", "service" — these are sub-concepts; Provider is the routing entity.
- **Seams:** Provider → ProviderRouter (BACKBONE), Provider → TokenBudget (INTERNAL)
- **Example:** Anthropic (claude-opus-4, claude-sonnet-4, claude-haiku-4), OpenAI (gpt-4o, o3).

---

### ProviderRouter
- **Definition:** The intelligent routing engine that selects the optimal Provider for each inference request based on task complexity, cost, latency, and runtime pressure.
- **Canonical name:** ProviderRouter
- **Not:** "model selector", "router", "dispatcher" — these miss the scoring and fallback semantics.
- **Seams:** ProviderRouter → Provider adapters (BACKBONE), ProviderRouter → TokenBudget (CRITICAL)
- **Example:** Routing a `/quick` task to Haiku, escalating to Opus when DEPTH analysis is required.

---

### Mode
- **Definition:** A named runtime execution profile that controls reasoning depth, token budget, approval flow, and provider selection across the entire Owl session.
- **Canonical name:** Mode
- **Not:** "setting", "configuration", "preset" — these miss the runtime-enforcement semantics.
- **Seams:** Mode → Engine (CRITICAL), Mode → ProviderRouter (INTERNAL)
- **Example:** Economy Mode (aggressive pruning, Haiku-first), God Mode (maximum autonomy, Opus-first).

---

### Token
- **Definition:** The atomic unit of LLM context consumption — tracked per request, per session, and per provider to enforce budgets and enable cost observability.
- **Canonical name:** Token
- **Not:** "credit", "unit", "character" — Token is the LLM-standard term.
- **Seams:** Token → TokenBudget (INTERNAL), Token → ProviderRouter (CRITICAL)
- **Example:** A Task consuming 4,200 input tokens and 812 output tokens against the Anthropic provider.

---

### TokenBudget
- **Definition:** A runtime-enforced constraint that caps token consumption per Task, per session, or per provider — preventing runaway costs and enforcing Economy Mode.
- **Canonical name:** TokenBudget
- **Not:** "limit", "cap", "quota" — these are generic; TokenBudget is the governed constraint.
- **Seams:** TokenBudget → Engine (CRITICAL), TokenBudget → ProviderRouter (INTERNAL)
- **Example:** Economy Mode enforces a 2,000 token budget per Task invocation.

---

### Pipeline
- **Definition:** The ordered, 7-stage execution flow through which every Mutation passes: Architectural Analysis → Contract Planning → Diff Generation → Impact Analysis → Approval → TLI → Verification.
- **Canonical name:** Pipeline
- **Not:** "workflow", "process", "steps" — Pipeline is the specific 7-stage artifact.
- **Seams:** Pipeline → EditingPipeline subsystem (INTERNAL), Pipeline → FMCF Governance (CRITICAL)
- **Example:** A /refactor command triggering all 7 Pipeline stages with per-file approval.

---

### Command
- **Definition:** A slash-prefixed developer instruction that triggers a specific Owl behavior — parsed, validated, and dispatched to the appropriate engine subsystem.
- **Canonical name:** Command
- **Not:** "slash command", "instruction", "directive" — Command is the parsed artifact.
- **Seams:** Command → CommandRegistry (INTERNAL), Command → Engine (CRITICAL)
- **Example:** `/deep analyze the authentication module` → DeepAnalysisCommand dispatched.

---

### Governance
- **Definition:** FMCF v3.5 rule enforcement applied at runtime to every Mutation — including Hash-First Hard-Lock, Seam Test Gate, Contract Diff Engine, and Grammar Drift Detector.
- **Canonical name:** Governance
- **Not:** "validation", "rules", "checks" — Governance is the constitutional enforcement layer.
- **Seams:** Governance → FMCFRuntime (BACKBONE), Governance → EditingPipeline (CRITICAL)
- **Example:** Governance blocking a Mutation because the .hash.md was not updated before TLI injection.

---

### Session
- **Definition:** A continuous, stateful interaction between a developer and Owl — bounded by process start and termination, persisting conversation history, active Mode, and registry state.
- **Canonical name:** Session
- **Not:** "conversation", "context", "chat" — Session implies statefulness and lifecycle management.
- **Seams:** Session → Engine (CRITICAL), Session → Registry (INTERNAL)
- **Example:** A Session beginning with /task and continuing through /deep, /diff, and /apply.

---

### Registry
- **Definition:** The FMCF hash-based source of truth for architectural state — the /hashes/ directory containing Grammar Shards, .hash.md files, seams.json, and all forensic records.
- **Canonical name:** Registry
- **Not:** "hashes", "metadata", "store" — Registry is the authoritative brain of the system.
- **Seams:** Registry → FMCFRuntime (BACKBONE), Registry → Governance (CRITICAL)
- **Example:** The Registry storing the DEPTH_SCORE and .contract.json for every tracked module.

---

### Rollback
- **Definition:** The deterministic restoration of pre-Mutation system state — files, Registry entries, hashes, and governance records — guaranteed to execute correctly on any exit.
- **Canonical name:** Rollback
- **Not:** "undo", "revert", "restore" — Rollback implies atomicity and governance record preservation.
- **Seams:** Rollback → EditingPipeline (CRITICAL), Rollback → Registry (CRITICAL)
- **Example:** /undo restoring all files modified during the last Mutation to their pre-edit state.

---

### Diff
- **Definition:** A structured, syntax-highlighted, FMCF-annotated view of the changes a Mutation will apply — displayed in the Center Panel before Approval.
- **Canonical name:** Diff
- **Not:** "changes", "delta", "patch" — Diff is the visual artifact shown for developer review.
- **Seams:** Diff → EditingPipeline (INTERNAL), Diff → TUI CenterPanel (CRITICAL)
- **Example:** A side-by-side Diff showing line 45 insertion with DEPTH_SCORE annotations.

---

### Seam
- **Definition:** A boundary in the source code where behavior can change without editing callers — the location of a pluggable interface. One adapter = hypothetical; two adapters = real Seam.
- **Canonical name:** Seam
- **Not:** "interface", "boundary", "abstraction" — Seam is the FMCF architectural location term.
- **Seams:** Seam → Registry (INTERNAL), Seam → FMCFRuntime (BACKBONE)
- **Example:** The ProviderRouter Seam — Anthropic adapter (prod), OpenAI adapter (prod), Ollama adapter (prod).

---

### TUI
- **Definition:** The terminal user interface through which developers interact with Owl — a three-panel, keyboard-first display built with Ink/React providing real-time observability.
- **Canonical name:** TUI
- **Not:** "UI", "terminal", "display" — TUI is the specific three-panel Ink runtime.
- **Seams:** TUI → Engine (CRITICAL), TUI → CommandRegistry (CRITICAL)
- **Example:** The TUI rendering the Left Panel (reasoning), Center Panel (diffs), Right Panel (metrics).

---

### Turn
- **Definition:** A single completed prompt-response cycle within a Session — one developer input paired with one Owl response, timestamped and persisted in the Conversation Thread.
- **Canonical name:** Turn
- **Not:** "message", "exchange", "interaction" — Turn is the archived unit of conversation history.
- **Seams:** Turn → ConversationThread (INTERNAL), Turn → Session (CRITICAL)
- **Example:** A Turn capturing the prompt "Refactor auth", the response text, latency 1240ms, and 3,200 tokens.

---

### Streaming
- **Definition:** The real-time, incremental delivery of Provider output tokens to the TUI as they are generated — enabling live display of partially-complete responses before inference completes.
- **Canonical name:** Streaming
- **Not:** "live output", "realtime", "chunk delivery" — Streaming is the governed delivery mode.
- **Seams:** Streaming → ProviderRouter (CRITICAL), Streaming → OutputPanel (CRITICAL)
- **Example:** The OutputPanel displaying "Analyzing your auth module…" character-by-character while Orchestrator streams Claude's response.

---

### Inference
- **Definition:** The LLM computation process triggered by a Task — routing through ProviderRouter, executing against the selected Provider, and returning a complete InferenceResponse (or streaming chunks).
- **Canonical name:** Inference
- **Not:** "completion", "generation", "API call" — Inference is the full governed round-trip.
- **Seams:** Inference → Orchestrator (CRITICAL), Inference → ProviderRouter (BACKBONE)
- **Example:** An Inference taking 1,240ms against claude-sonnet-4, consuming 4,200 input tokens and yielding 812 output tokens.

---

### RoutingPreference
- **Definition:** A developer-selected Provider preference that deterministically overrides automatic ProviderRouter scoring until cleared.
- **Canonical name:** RoutingPreference
- **Not:** "model setting", "provider flag", "routing hint" — RoutingPreference is runtime state that changes Provider selection behavior.
- **Seams:** RoutingPreference → ProviderRouter (CRITICAL), RoutingPreference → CommandRegistry (CRITICAL)
- **Example:** `/model anthropic` setting the active RoutingPreference so the next Inference routes to Anthropic when available.

---

### UsageMetrics
- **Definition:** Runtime-observed Inference usage totals for Tokens, Provider calls, Model selection, and latency within the active Session.
- **Canonical name:** UsageMetrics
- **Not:** "analytics", "logs", "stats" — UsageMetrics is deterministic runtime accounting, not external telemetry.
- **Seams:** UsageMetrics → Orchestrator (CRITICAL), UsageMetrics → CommandRegistry (CRITICAL)
- **Example:** `/status` showing 3 Provider calls, 12,400 total Tokens, Anthropic as the top Provider, and 1,250ms average latency.

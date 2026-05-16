---
Project: Owl
Version: FMCF v3.5
Last_Updated: 2026-05-16T17:46:00Z
Source: FMCF v3.5 Mathematical Constitution + Ousterhout "A Philosophy of Software Design"
---

# Architecture Vocabulary

Defines the fundamental concepts and metrics for software quality in the Owl system. Grounded in Ousterhout's *A Philosophy of Software Design*.

---

### Module
- **Definition:** Any unit that has an interface and an implementation: a function, class, package, or tier-slice. Scale-agnostic — a single function and an entire subsystem are both Modules.
- **The unit of depth analysis.** When assessing architectural quality, ask: what is this Module's depth?

---

### Interface
- **Definition:** Everything a caller must know to use the Module correctly. Not just the TypeScript signature — includes types, invariants, error modes, ordering constraints, configuration requirements, and side effects.
- **Rule:** If a caller needs to know it, it is part of the Interface. If callers start depending on implementation details, the boundary has already leaked.

---

### Implementation
- **Definition:** The body of code inside the Module that carries out the promises the Interface makes. Callers never depend on this directly.

---

### Depth
- **Definition:** The ratio of behaviors a caller can exercise to the amount of Interface they must learn. A deep Module provides powerful functionality behind a simple Interface — high behavioral payoff per unit of learning cost.
- **This is a quality measure, not a size measure.**

---

### Deep Module
- **Definition:** Small Interface, large and powerful Implementation. A caller learns little but can accomplish a lot. **The goal of every deepening effort.**
- **Warning:** A large Implementation is not sufficient for depth. If it trivially maps one method to one behavior (no hiding, no abstraction), the Module is still shallow despite its size. Apply the deletion test.

---

### Shallow Module
- **Definition:** Complex Interface relative to the functionality it provides. The caller pays a high learning cost for little behavioral gain. **The primary target of deepening.**

---

### Seam
- **Definition:** Where an Interface lives; where behavior can change without editing callers. One adapter = hypothetical seam. Two adapters = real Seam.
- **Seam capacity** determines deepening investment. Never over-engineer a low-capacity seam.

---

### Seam Capacity
- **BACKBONE** (9–10): 2+ production adapters + high change frequency. Deepen heavily.
- **CRITICAL** (5–8): 1 production adapter on a core execution path. Deepen moderately.
- **EXPLORATORY** (2–4): 1 adapter, speculative variation. Keep simple; collapse if never promoted.
- **INTERNAL**: Both modules in the same subsystem. Tight coupling is intentional — do not apply seam rules.

---

### Locality
- **Definition:** The property where bugs and changes are concentrated in one place (good) vs. scattered across N callers (bad). Depth grants Locality because implementation details are hidden — callers cannot depend on what they cannot see.

---

### Deepening
- **Definition:** The act of redesigning a Module's Interface to hide more Implementation behind a simpler surface, increasing the behavioral payoff per unit of Interface learned.
- **Deepening effort is proportional to Seam capacity.** Never deepen a EXPLORATORY seam.

---

### Deletion Test
- **Definition:** If you deleted this Module, would complexity reappear across its callers? If yes → the Module was earning its depth. If no → it was a pass-through and its depth score was misleading.

---

### Leverage
- **Definition (Metric):** `(Implementation_Size - Interface_Size) / Implementation_Size`. Proxy for behavioral payoff — how much implementation is hidden behind how small a surface. One input into DEPTH_SCORE.

---

### DEPTH_SCORE
- **Definition (Metric):** `(Leverage + Locality + Testability) / 3 - Complexity_Tax`
  - `> 0.70` → DEEP (defend against changes)
  - `0.40–0.70` → MEDIUM (selective deepening candidate)
  - `< 0.40` → SHALLOW (urgent deepening needed)

---

### Complexity Tax
- **Definition:** A penalty applied to the `DEPTH_SCORE` for modules with excessive interface surface, leaky abstractions, or high cognitive load requirements for basic usage.

---

# FMCF v3.5 Constitution

The "Mathematical Constitution" defines the non-negotiable laws that govern all AI behavior and code mutations in Owl.

---

### Constitutional Enforcement
- **Definition:** The automated validation of all AI actions against the FMCF laws via the `GovernanceEngine`. Violations block the pipeline immediately.

---

### Hash-First Hard-Lock
- **Definition (Law 1):** The requirement that the Hash Registry and `.contract.json` must be updated and committed *before* any implementation code (TLI) is injected. Ensures blueprints are validated before construction.

---

### Sequential Integrity (Loopback)
- **Definition (Law 2):** Every Terminal Logic Injection (TLI) must be immediately followed by a registry update to maintain the Hash Registry's integrity. No code exists without a corresponding hash mirror.

---

### Specialist-Silo Constraint
- **Definition (Law 3):** Strict enforcement of AI agent capabilities based on their current active Role. Agents cannot "drift" outside their silo's responsibilities or prohibitions.

---

### Shard Split Protocol
- **Definition (Law 4):** When a proposed change touches >15% of a file, FMCF mandates a Shard Split — decomposition into smaller, more focused modules — rather than allowing a single module to grow excessively complex (shallow).

---

### Collapse Protocol
- **Definition:** The automated process of identifying and deleting EXPLORATORY seams that have not been reclassified or utilized for 6 months. Prevents "ghost architecture" from accumulating.

---

# Mutation Pipeline

The 7-stage workflow for every code change in the Owl system.

---

### TLI (Terminal Logic Injection)
- **Definition:** The act of an AI agent writing implementation code to the local filesystem. Highly governed and subject to the Loopback Law.

---

### Rollback System
- **Definition:** A register-before-write mechanism that captures the pre-mutation state of all targeted files. Ensures a full "Undo" is possible if any stage of the pipeline fails.

---

### Verification Gate
- **Definition:** The final stage of the mutation pipeline that confirms post-write scope, ensures types still check, and validates that the Hash Registry matches the new state.

---

### Impact Analysis
- **Definition:** The automated assessment of a mutation's reach across the codebase, used to detect Shard Split requirements and side-effect risks.

---

# AI Role Definitions (The Deepening Flow)

The sequential progression of identities that an agent assumes during a task.

---

### Architect
- **Identity:** The entry role for every Deepening Flow.
- **Responsibilities:** Topology design, Friction Discovery, Seam Analysis, Deepening strategy, and the Grilling Loop.
- **Prohibitions:** Strictly prohibited from writing code, writing contracts, or editing the registry.

---

### DNA Engineer
- **Identity:** The contract specialist.
- **Responsibilities:** Definition of schemas, interfaces, and `.contract.json` blueprints based on the Architect's topology.
- **Prohibitions:** Prohibited from writing implementation code or final registry updates.

---

### Shadow
- **Identity:** The builder.
- **Responsibilities:** TLI (Terminal Logic Injection) implementation of the blueprints defined by the DNA Engineer.
- **Prohibitions:** Prohibited from registry updates; MUST hand off to the Forensic Guardian for finalization.

---

### Forensic Guardian
- **Identity:** The validator and closer.
- **Responsibilities:** Registry updates, checksum verification, and final mutation closure. The only role that can finalize the "Loopback" to the Hash Registry.

---

# Pattern Terminology

---

### Topology
- **Definition:** The map of how modules connect and where boundaries (seams) exist within a subsystem. The primary responsibility of the Architect.

---

### Friction Discovery
- **Definition:** Identifying points in the codebase where implementation details leak into interfaces or where "shallow" modules are creating high cognitive tax.

---

### Seam Analysis
- **Definition:** Assessing the capacity and health of existing interfaces to determine if they should be Deepened, Maintained, or Collapsed.

---

### Grilling Loop
- **Definition:** A high-frequency adversarial reasoning cycle where the Architect challenges its own topology design to find edge cases and leaky boundaries before blueprints are finalized.

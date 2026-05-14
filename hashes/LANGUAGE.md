---
Project: Owl
Version: FMCF v3.5
Last_Updated: 2026-05-14T15:03:00Z
Source: FMCF v3.5 Mathematical Constitution + Ousterhout "A Philosophy of Software Design"
---

# Architecture Vocabulary

Defines how we talk about the code itself. Grounded in Ousterhout's *A Philosophy of Software Design*.
Every architectural discussion, seam classification, and depth analysis MUST use these terms exactly.

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

### Seam Capacity
- **BACKBONE** (9–10): 2+ production adapters + high change frequency. Deepen heavily.
- **CRITICAL** (5–8): 1 production adapter on a core execution path. Deepen moderately.
- **EXPLORATORY** (2–4): 1 adapter, speculative variation. Keep simple; collapse if never promoted.
- **INTERNAL**: Both modules in the same subsystem. Tight coupling is intentional — do not apply seam rules.

---

### Shard Split
- **Definition:** When a proposed change touches >15% of a file, FMCF mandates a Shard Split recommendation before proceeding — proposing decomposition into smaller, more focused modules rather than continuing to grow a large one.

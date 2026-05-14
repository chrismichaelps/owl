/**
 * @Owl.FMCF.Roles.DNAEngineer - DNA Engineer role definition
 *
 * Phase 2 of the Deepening Flow: after the Architect defines topology, the DNA Engineer
 * creates contracts (`.contract.json` files) and logic blueprints (`.logic.md` files).
 *
 * The DNA Engineer transforms architectural intent into concrete specifications. It defines:
 * - What each module must do (contracts)
 * - How modules interact (interface specifications)
 * - Logic flow for complex operations (blueprints)
 *
 * Prohibited from: writing implementation code, editing the atlas, proposing architecture.
 * This separation ensures architecture flows through the proper pipeline, not around it.
 *
 * @example
 * DNA_ENGINEER_ROLE.responsibilities.includes("write-contracts") // true
 * DNA_ENGINEER_ROLE.prohibited.includes("write-implementation") // true
 *
 * @see ARCHITECT_ROLE - The role that precedes DNA Engineer
 * @see SHADOW_ROLE - The role that follows DNA Engineer
 */
import type { RoleDefinition } from "./architect.js"

/** @Owl.FMCF.Roles.DNAEngineer.Role - Contract for logic blueprinting */
export const DNA_ENGINEER_ROLE: RoleDefinition = {
  id: "dna-engineer",
  responsibilities: ["write-contracts", "write-logic-blueprints"],
  prohibited: ["write-implementation", "edit-atlas", "propose-architecture"],
}

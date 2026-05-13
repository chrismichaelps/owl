/** @Owl.FMCF.Roles.DNAEngineer - DNA Engineer role definition */
import type { RoleDefinition } from "./architect.js"

/** @Owl.FMCF.Roles.DNAEngineer.Role - Contract for logic blueprinting */
export const DNA_ENGINEER_ROLE: RoleDefinition = {
  id: "dna-engineer",
  responsibilities: ["write-contracts", "write-logic-blueprints"],
  prohibited: ["write-implementation", "edit-atlas", "propose-architecture"],
}

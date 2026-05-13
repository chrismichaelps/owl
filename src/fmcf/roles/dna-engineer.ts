/** @Owl.FMCF.Roles.DNAEngineer - DNA Engineer role definition */
import type { RoleDefinition } from "./architect.js"

export const DNA_ENGINEER_ROLE: RoleDefinition = {
  id: "dna-engineer",
  responsibilities: ["write-contracts", "write-logic-blueprints"],
  prohibited: [
    "write-implementation",
    "edit-atlas",
    "propose-architecture",
  ],
}

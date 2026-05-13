/** @Owl.FMCF.Roles.Shadow - Shadow role definition (TLI only) */
import type { RoleDefinition } from "./architect.js"

export const SHADOW_ROLE: RoleDefinition = {
  id: "shadow",
  responsibilities: ["targeted-line-injection", "surgical-code-changes"],
  prohibited: ["change-contracts", "change-seams", "change-registry"],
}

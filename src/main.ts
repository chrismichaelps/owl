/** @Owl.Entry - CLI entry point */
import { Effect } from "effect"

/** @Owl.Entry.Logic - Main execution loop */
const main = Effect.sync(() => {
  console.log("Owl — AI coding agent")
})

Effect.runSync(main)

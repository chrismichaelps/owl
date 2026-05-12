/** @Owl.Entry - CLI entry point */
import { Effect } from "effect"

const main = Effect.sync(() => {
  console.log("Owl — AI coding agent")
})

Effect.runSync(main)

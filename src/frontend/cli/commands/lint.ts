import { App } from "../../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["lint"],
  aliases: [],
  describe: "lint the local config",
  builder: undefined,
  handler: (_args: Args, _app: App) => {
    console.log("--- LINT ---");
    console.log("TODO: No diagnostics");
    console.log("--- LINT ---");
  },
} as const;

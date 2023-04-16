import { lintConfig } from "../../../backend/lint.js";
import { App } from "../../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["lint"],
  aliases: [],
  describe: "lint the local config",
  builder: undefined,
  handler: (_: Args, app: App) => {
    console.log("--- LINT ---");
    const diagnostics = lintConfig(app.localConfig);

    for (const diagnostic of diagnostics) {
      console.log(
        diagnostic.severity.toUpperCase(),
        "@",
        diagnostic.identifier,
        "::",
        diagnostic.message
      );
    }

    if (!diagnostics.length) {
      console.log("No diagnostics! :D");
    }

    console.log("--- LINT ---");
  },
};

import { Args } from "../interface.js";
import { App } from "../../../index.js";

export default {
  command: ["dump"],
  aliases: [],
  describe: "dump the local config as JSON",
  builder: undefined,
  handler: (_args: Args, app: App) => {
    // Do not use the logger here, this should be clean for piping or redirection
    console.log(JSON.stringify(app.localConfig, undefined, 2));
  },
};

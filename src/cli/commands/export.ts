import { App } from "../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["export"],
  aliases: [],
  describe: "export the local config with the chosen backend",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    // Do not use the logger here, this should be clean for piping or redirection

    const localConfig = await app.loadLocalConfig();
    console.log(app.backend.exportConfig(localConfig));
  },
};

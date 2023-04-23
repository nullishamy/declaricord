import { App } from "../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["pull"],
  aliases: [],
  describe: "pull the config from discord",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    await app.client.awaitReady();
    const remoteConfig = await app.client.pull(app.localConfig.guildId);
    console.log(JSON.stringify(remoteConfig, undefined, 2));
  },
};

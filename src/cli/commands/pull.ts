import { App } from "../../index.js";
import { sortConfiguration } from "../../util/sort.js";
import { Args } from "../interface.js";

export default {
  command: ["pull"],
  aliases: [],
  describe: "pull the config from discord",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    const localConfig = await app.loadLocalConfig();

    await app.client.awaitReady();
    sortConfiguration(localConfig);

    const remoteConfig = await app.client.pull(localConfig.guildId);
    console.log(JSON.stringify(remoteConfig, undefined, 2));
  },
};

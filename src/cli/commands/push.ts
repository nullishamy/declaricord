import { App } from "../../index.js";
import { sortConfiguration } from "../../util/sort.js";
import { Args } from "../interface.js";

export default {
  command: ["push"],
  aliases: [],
  describe: "push the config to discord",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    logger.info("Loading client");
    await app.client.awaitReady();

    logger.info("Pulling configs in...");
    const localConfig = await app.loadLocalConfig();
    const remoteConfig = await app.client.pull(localConfig.guildId);
    logger.info("Done, sorting...");

    sortConfiguration(localConfig);
    sortConfiguration(remoteConfig);

    logger.info("Done, pushing ...");
    await app.client.push(localConfig);
    logger.info("Pushed configuration to Discord");
  },
};

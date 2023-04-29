import { App } from "../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["push"],
  aliases: [],
  describe: "push the config to discord",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    const localConfig = await app.loadLocalConfig();

    await app.client.awaitReady();

    logger.debug("--- CONFIG ---");
    // logger.debug(JSON.stringify(localConfig, undefined, 2));
    logger.debug("--- CONFIG ---");

    logger.info("... Pushing ...");
    await app.client.push(localConfig);
    logger.info("Done!");
  },
};

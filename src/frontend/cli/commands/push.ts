import { App } from "../../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["push"],
  aliases: [],
  describe: "push the config to discord",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    await app.client.awaitReady();
    logger.debug("--- CONFIG ---");
    logger.debug(JSON.stringify(app.localConfig, undefined, 2));
    logger.debug("--- CONFIG ---");

    logger.info("... Pushing ...");
    await app.client.push(app.localConfig);
    logger.info("Done!");
  },
};

import { diffConfigurations } from "../../backend/diff.js";
import { App } from "../../index.js";
import { applyPredicatesToRemote } from "../../util/filter.js";
import { Args } from "../interface.js";

export default {
  command: ["diff"],
  aliases: [],
  describe: "diff the local and remote configs",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    const localConfig = await app.loadLocalConfig();
    await app.client.awaitReady();

    const remoteConfig = await app.client.pull(localConfig.guildId);
    applyPredicatesToRemote(localConfig, remoteConfig);

    logger.info("--- DIFF ---");
    logger.info(diffConfigurations(localConfig, remoteConfig));
    logger.info("--- DIFF ---");
  },
};

import { Args } from "../interface.js";
import { diffConfigurations } from "../../../backend/diff.js";
import { App } from "../../../index.js";
import { applyPredicatesToRemote } from "../../../util/filter.js";

export default {
  command: ["diff"],
  aliases: [],
  describe: "diff the local and remote configs",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    await app.client.awaitReady();

    const remoteConfig = await app.client.pull(app.localConfig.guildId);
    applyPredicatesToRemote(app.localConfig, remoteConfig);
    logger.info("--- DIFF ---");
    logger.info(diffConfigurations(app.localConfig, remoteConfig));
    logger.info("--- DIFF ---");
  },
};

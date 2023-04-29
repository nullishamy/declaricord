import { diffConfigurations } from "../../backend/diff.js";
import { App } from "../../index.js";
import { applyPredicatesToRemote } from "../../util/filter.js";
import { sortConfiguration } from "../../util/sort.js";
import { Args } from "../interface.js";

export default {
  command: ["diff"],
  aliases: [],
  describe: "diff the local and remote configs",
  builder: undefined,
  handler: async (_args: Args, app: App) => {
    logger.info("Loading client");
    await app.client.awaitReady();

    const localConfig = await app.loadLocalConfig();
    const remoteConfig = await app.client.pull(localConfig.guildId);

    sortConfiguration(remoteConfig);
    sortConfiguration(localConfig);

    applyPredicatesToRemote(localConfig, remoteConfig);

    logger.info("Diff:");
    logger.info(diffConfigurations(localConfig, remoteConfig));
  },
};

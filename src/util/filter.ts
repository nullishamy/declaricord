import assert from "assert";
import { GuildConfiguration } from "./schema.js";

export function applyPredicatesToRemote(
  local: GuildConfiguration,
  remote: GuildConfiguration
) {
  if (local.categories.length !== remote.categories.length) {
    logger.warn(
      `Aborting category filter, length mismatch (remote: ${remote.categories.length}, local: ${local.categories.length})`
    );
  } else {
    // Filter out categories based on local predicate
    // The lengths align, so it is safe to access local by index
    remote.categories.forEach((remoteCat, idx) => {
      const localCat = local.categories[idx];
      assert(localCat, `no local category at index ${idx}?`);

      if (localCat.id !== remoteCat.id) {
        logger.info(
          `Dropping remote ${remoteCat.comment} (${remoteCat.id}), ID mismatch. expected: ${localCat.comment} (${localCat.id})`
        );
        // Allow the item to pass, to keep lengths the same
        // Diffs will show us the problem later
        return true;
      }

      // Only test the remote
      // Locals are tested in the frontend
      remoteCat.channels = remoteCat.channels.filter((channel) => {
        if (!localCat.predicate(channel)) {
          logger.info(
            `Dropping local channel ${channel.comment} (${channel.id}) in ${remoteCat.comment} (${remoteCat.id}), predicate failed`
          );
          return false;
        }

        return true;
      });

      return true;
    });
  }
}

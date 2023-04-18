import { Category, GuildChannelWithOpts, Override } from "./schema.js";

interface HasId {
  id: string;
}
export function snowflakeSorter(a: HasId, b: HasId): number {
  return Number(a.id) - Number(b.id);
}

export function sortOverrides(val: { overrides: Override[] }) {
  val.overrides.sort(snowflakeSorter);
}
export function inheritIntoChild(
  parent: Category,
  child: GuildChannelWithOpts
) {
  for (const override of parent.overrides) {
    const channelOverride = child.overrides.find((o) => o.id === override.id);

    // The channel declares some override with the same ID as the category
    // We should merge keys set to inherit from the category
    if (channelOverride) {
      for (const [perm, enabled] of Object.entries(
        channelOverride.permissions
      )) {
        const shouldSync = enabled === undefined;

        if (shouldSync) {
          // Move the category permission setting into the channel
          channelOverride.permissions[perm] = override.permissions[perm];
        }
      }
    } else {
      // Otherwise, we should just push the override directly
      // The channel does not declare its own version
      child.overrides.push(override);
    }
  }

  sortOverrides(child);
}

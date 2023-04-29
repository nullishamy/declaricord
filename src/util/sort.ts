import { GuildConfiguration } from "./schema.js";

interface HasId {
  id: string;
}

export function snowflakeSorter(a: HasId, b: HasId): number {
  return Number(a.id) - Number(b.id);
}

export function sortConfiguration(
  config: GuildConfiguration
): GuildConfiguration {
  for (const channel of config.globalChannels) {
    channel.overrides.sort(snowflakeSorter);
    channel.tags?.sort(snowflakeSorter);
  }

  config.globalChannels.sort(snowflakeSorter);
  config.globalRoles.sort(snowflakeSorter);

  for (const category of config.categories) {
    for (const channel of category.channels) {
      channel.overrides.sort(snowflakeSorter);
      channel.tags?.sort(snowflakeSorter);
    }

    category.channels.sort(snowflakeSorter);
    category.overrides.sort(snowflakeSorter);
  }

  config.categories.sort(snowflakeSorter);

  return config;
}

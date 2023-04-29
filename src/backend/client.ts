import { GuildConfiguration } from "../util/schema.js";
import { Backend } from "./abstraction.js";

export class Client {
  constructor(private readonly api: Backend) {}

  async awaitReady() {
    await this.api.initialise();
  }

  async pull(guildId: string): Promise<GuildConfiguration> {
    const globalChannels = await this.api.fetchGlobalChannels();
    const globalRoles = await this.api.fetchRoles();

    return {
      guildId,
      globalChannels,
      globalRoles,
      categories: await this.api.fetchCategories(),
    };
  }

  async push(configuration: GuildConfiguration): Promise<void> {
    // Push global role updates
    for (const role of configuration.globalRoles) {
      await this.api.pushRole(role);
    }

    // Push global channel updates
    for (const channel of configuration.globalChannels) {
      await this.api.pushChannel(channel);
    }

    // Push category updates
    for (const category of configuration.categories) {
      for (const channel of category.channels) {
        await this.api.pushChannel(channel);
      }

      // Update the category itself
      await this.api.pushCategory(category);
    }
  }
}

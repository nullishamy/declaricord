import { GuildConfiguration } from "../util/schema.js";
import { API, APIImpl } from "./api.js";

export class Client {
  private readonly api: API;
  constructor(guildId: string, token: string) {
    this.api = new APIImpl(guildId, token);
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

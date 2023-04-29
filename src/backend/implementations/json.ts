import {
  Category,
  GuildChannelWithOpts,
  GuildConfiguration,
  Role,
} from "../../util/schema.js";
import { Backend } from "../abstraction.js";

export class JsonBackend extends Backend {
  public readonly config: GuildConfiguration;

  constructor(guildId: string) {
    super();
    this.config = {
      guildId,
      globalRoles: [],
      globalChannels: [],
      categories: [],
    };
  }

  initialise(): Promise<void> {
    return Promise.resolve();
  }

  fetchGlobalChannels(): Promise<GuildChannelWithOpts[]> {
    return Promise.resolve(this.config.globalChannels);
  }

  fetchRoles(): Promise<Role[]> {
    return Promise.resolve(this.config.globalRoles);
  }

  fetchCategories(): Promise<Category[]> {
    return Promise.resolve(this.config.categories);
  }

  pushChannel(channel: GuildChannelWithOpts): Promise<void> {
    this.config.globalChannels.push(channel);
    return Promise.resolve();
  }

  pushCategory(category: Category): Promise<void> {
    this.config.categories.push(category);
    return Promise.resolve();
  }

  pushRole(role: Role): Promise<void> {
    this.config.globalRoles.push(role);
    return Promise.resolve();
  }
}

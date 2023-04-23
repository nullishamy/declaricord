import assert from "assert";
import { Category, GuildChannelWithOpts, Role } from "../util/schema.js";

export abstract class API {
  protected init = false;

  public isInitialised() {
    return this.init;
  }

  protected assertInitialised() {
    assert(this.init, "API is not ready, call initialise()!");
  }

  abstract initialise(): Promise<void>;

  abstract fetchGlobalChannels(): Promise<GuildChannelWithOpts[]>;
  abstract fetchRoles(): Promise<Role[]>;
  abstract fetchCategories(): Promise<Category[]>;

  abstract pushChannel(channel: GuildChannelWithOpts): Promise<void>;
  abstract pushCategory(category: Category): Promise<void>;
  abstract pushRole(role: Role): Promise<void>;
}

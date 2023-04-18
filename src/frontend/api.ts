import fs from "fs/promises";
import { LuaFactory } from "wasmoon";
import { z } from "zod";
import { luaLib } from "../runtime/index.js";
import { validated } from "../util/lua.js";
import {
  inheritIntoChild,
  snowflakeSorter,
  sortOverrides,
} from "../util/permissions.js";
import {
  Category,
  GuildChannelWithOpts,
  GuildConfiguration,
  Role,
  TextChannelWithOpts,
  VoiceChannelWithOpts,
} from "../util/schema.js";

const factory = new LuaFactory();
const engine = await factory.createEngine();

export class GuildSetup {
  public globalChannels: GuildChannelWithOpts[] = [];
  public globalRoles: Role[] = [];
  public categories: Category[] = [];

  constructor(public readonly id: string) {}

  // Orphan setup
  global = {
    text: validated((tbl) => {
      this.globalChannels.push(tbl);
    }, TextChannelWithOpts),
    voice: validated((tbl) => {
      this.globalChannels.push(tbl);
    }, VoiceChannelWithOpts),
    role: validated((tbl) => this.globalRoles.push(tbl), Role),
  };

  // Category setup
  channel = {
    text: (tbl: unknown) => ({
      type: "text",
      ...z.object({}).passthrough().parse(tbl),
    }),
    voice: (tbl: unknown) => ({
      type: "voice",
      ...z.object({}).passthrough().parse(tbl),
    }),
  };

  override = {
    role: (tbl: unknown) => ({
      type: "role",
      ...z.object({}).passthrough().parse(tbl),
    }),
    user: (tbl: unknown) => ({
      type: "user",
      ...z.object({}).passthrough().parse(tbl),
    }),
  };

  category = validated((tbl) => this.categories.push(tbl), Category);
}

export class GuildBuilder {
  static LIB_NAME = "discord";

  constructor(private readonly configPath: string) {}

  async evaluateConfiguration(): Promise<GuildConfiguration> {
    engine.global.set("discord", () => {
      return luaLib;
    });

    // We must mount before executing in order to utilize a byte buffer for the content
    // this keeps all text intact (unicode doesn't play nice otherwise)
    await factory.mountFile(
      this.configPath,
      await fs.readFile(this.configPath)
    );
    const result: unknown = await engine.doFile(this.configPath);

    // Call the provided setup function after validating the shape
    const validResult = z
      .object({
        id: z.string().nonempty(),
        setup: z.function(),
      })
      .parse(result);

    const setup = new GuildSetup(validResult.id);
    validResult.setup(setup);

    // Apply inheritance rules
    // We must do this ourselves because Discord "syncing" and "inheritance" are simply client terms
    // The API does not acknowledge this concept
    for (const category of setup.categories) {
      for (const channel of category.channels) {
        inheritIntoChild(category, channel);
      }

      sortOverrides(category);
    }

    // Apply predicate rules to local config
    // Remote filtering will happen later
    setup.categories.forEach((category) => {
      category.channels = category.channels.filter((channel) => {
        if (!channel.predicate(channel) || !category.predicate(channel)) {
          logger.info(
            `Dropping local channel ${channel.comment} (${channel.id}) in ${category.comment} (${category.id}), predicate failed`
          );
          return false;
        }
        return true;
      });

      return true;
    });

    setup.categories.sort(snowflakeSorter);

    return {
      guildId: setup.id,
      globalChannels: setup.globalChannels.sort(snowflakeSorter),
      globalRoles: setup.globalRoles.sort(snowflakeSorter),
      categories: setup.categories,
    };
  }
}

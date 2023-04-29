import { Frontend, ParseResult } from "../abstraction.js";
import {
  Category,
  GuildChannelWithOpts,
  Role,
  TextChannelWithOpts,
  VoiceChannelWithOpts,
} from "../../util/schema.js";
import { z } from "zod";
import { validated } from "../../util/lua.js";
import { LuaFactory } from "wasmoon";
import { luaLib } from "../../support/index.js";
import path from "path";
import fsp from "fs/promises";
import {
  inheritIntoChild,
  snowflakeSorter,
  sortOverrides,
} from "../../util/permissions.js";

export class LuaFrontend extends Frontend {
  parseFromData(): Promise<ParseResult> {
    return Promise.resolve({
      success: false,
      err: new Error("Cannot parse Lua from data, use parseFromFile instead"),
    } as const);
  }

  async parseFromFile(configPath: string, force = false): Promise<ParseResult> {
    if (this.loadedConfig && !force) {
      return Promise.resolve({
        success: true,
        data: this.loadedConfig,
      });
    }

    const factory = new LuaFactory();
    const engine = await factory.createEngine();

    // Mount a phony `discord` file so that we can require it to load our
    // library. We must use a fake file because teal wants us to use `require` to load teal files
    await factory.mountFile("./discord.lua", "return discord()");

    // ..then use that call to return our lib into lua
    engine.global.set("discord", () => {
      return luaLib;
    });

    // wasmoon uses a virtual fs, so we should load all lua around the entrypoint
    // so it can be seen by the runtime
    const luawasm = await factory.getLuaModule();
    const base = path.resolve(path.dirname(configPath));

    const resolveLuaIn = async (dir: string, luaDir = "./") => {
      const dirContents = await fsp.readdir(dir, {
        withFileTypes: true,
      });

      for (const entry of dirContents) {
        if (entry.isDirectory()) {
          luawasm.module.FS.mkdir(entry.name);
          await resolveLuaIn(
            path.resolve(base, entry.name),
            path.join(luaDir, entry.name)
          );
        }

        if (!(entry.name.endsWith(".lua") || entry.name.endsWith(".tl"))) {
          continue;
        }

        luawasm.module.FS.writeFile(
          path.join(luaDir, entry.name),
          await fsp.readFile(path.resolve(dir, entry.name))
        );
      }
    };

    await resolveLuaIn(base);

    const teal = await fsp.readFile("./teal-compiler/tl.lua");

    await factory.mountFile("./tl.lua", teal);
    await engine.doString(`require("tl").loader()`);

    // We must mount before executing in order to utilize a byte buffer for the content
    // this keeps all text intact (unicode doesn't play nice otherwise)

    // Hard coding init.lua is okay because nothing will be able to import us
    // you'd have circular dependencies otherwise

    // This makes it easier to get teal injected because the root isn't shifting about
    await factory.mountFile("./init.lua", await fsp.readFile(configPath));

    const result: unknown = await engine.doString(`return require("init")`);

    // Call the provided setup function after validating the shape
    const validResult = z
      .object({
        id: z.string().nonempty(),
        setup: z.function(),
      })
      .parse(result);

    const setup = new LuaAPI();
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

    const config = {
      success: true,
      data: {
        guildId: validResult.id,
        globalChannels: setup.globalChannels.sort(snowflakeSorter),
        globalRoles: setup.globalRoles.sort(snowflakeSorter),
        categories: setup.categories,
      },
    } as const;

    this.loadedConfig = config.data;

    return config;
  }
}

export class LuaAPI {
  public globalChannels: GuildChannelWithOpts[] = [];
  public globalRoles: Role[] = [];
  public categories: Category[] = [];

  // Orphan setup
  global = {
    text: validated((tbl) => {
      this.globalChannels.push(tbl);
    }, TextChannelWithOpts),
    voice: validated((tbl) => {
      this.globalChannels.push(tbl);
    }, VoiceChannelWithOpts),
    role: validated((tbl) => {
      this.globalRoles.push(tbl);
    }, Role),
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

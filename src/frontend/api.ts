import assert from "assert";
import { LuaFactory } from "wasmoon";
import { z } from "zod";
import { luaLib } from "../runtime/index.js";
import { validated } from "../util/lua.js";
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
  public readonly globalChannels: GuildChannelWithOpts[] = [];
  public readonly globalRoles: Role[] = [];
  public readonly categories: Category[] = [];

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

  role = (tbl: unknown) => tbl;

  category = validated((tbl) => this.categories.push(tbl), Category);
}

export class GuildBuilder {
  static LIB_NAME = "discord";

  constructor(private readonly config: string) {}

  async evaluateConfiguration(): Promise<GuildConfiguration> {
    // HACK: maybe find a better way to do this
    // We hack into require to make our lib a module
    const _require: unknown = engine.global.get("require");
    assert(typeof _require === "function", "require was not a function");

    engine.global.set("require", (maybeLibName: unknown) => {
      if (maybeLibName === GuildBuilder.LIB_NAME) {
        return luaLib;
      } else {
        return _require(maybeLibName) as unknown;
      }
    });

    const result: unknown = await engine.doString(this.config);

    // Call the provided setup function after validating the shape
    const validResult = z
      .object({
        id: z.string().nonempty(),
        setup: z.function(),
      })
      .parse(result);

    const setup = new GuildSetup(validResult.id);
    validResult.setup(setup);

    return {
      guildId: setup.id,
      globalChannels: setup.globalChannels.sort((a, b) =>
        a.id.localeCompare(b.id)
      ),
      globalRoles: setup.globalRoles.sort((a, b) => a.id.localeCompare(b.id)),
      categories: setup.categories,
    };
  }
}

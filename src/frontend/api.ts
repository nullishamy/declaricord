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

    const atEveryone = setup.globalRoles.find((r) => r.comment === "@everyone");

    if (!atEveryone) {
      throw new Error("@everyone role not declared, please declare it");
    }

    // Inherit perms from @everyone (that grant perms) in every global role
    const applicablePerms = Object.entries(atEveryone.permissions)
      .filter(([, enabled]) => enabled)
      .reduce<Record<string, boolean | undefined>>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    setup.globalRoles = setup.globalRoles.map((r) => ({
      ...r,
      permissions: {
        ...r.permissions,
        ...applicablePerms,
      },
    }));

    // Inherit perms from categories into their children
    for (const category of setup.categories) {
      for (const channel of category.channels) {
        for (const override of category.overrides) {
          const channelOverride = channel.overrides.find(
            (o) => o.id === override.id
          );

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
            channel.overrides.push(override);
          }
        }
      }
    }

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

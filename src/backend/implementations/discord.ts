import { REST } from "@discordjs/rest";
import assert from "assert";
import deepDiff from "deep-diff";
import {
  APIChannel,
  APIGuild,
  APIGuildVoiceChannel,
  APIOverwrite,
  APIRole,
  APITextChannel,
  APIUser,
  ChannelType,
  OverwriteType,
  Routes,
} from "discord-api-types/v10";
import {
  inheritIntoChild,
  snowflakeSorter,
  sortOverrides,
} from "../../util/permissions.js";
import {
  Category,
  GuildChannelWithOpts,
  Override,
  Role,
} from "../../util/schema.js";
import { API } from "../interface.js";

import {
  AllDisabledPerms,
  AllUndefinedPerms,
  bitfieldToString,
  stringToBitField,
} from "../permissions.js";

export class APISetupOptions {
  id: string;
  token: string;
}

export class DiscordAPI extends API {
  private fetchedGuild: APIGuild;
  private fetchedChannels: APIChannel[];
  private fetchedUsers: APIUser[];

  private mappedRoles: Record<string, APIRole>;
  private mappedChannels: Record<string, APIChannel>;
  private mappedUsers: Record<string, APIUser>;

  public static API_VERSION = "10";
  protected readonly rest: REST;

  constructor(private readonly opts: APISetupOptions) {
    super();
    this.rest = new REST({ version: DiscordAPI.API_VERSION }).setToken(
      opts.token
    );
  }

  async initialise(): Promise<void> {
    this.fetchedChannels = (await this.rest.get(
      Routes.guildChannels(this.opts.id)
    )) as APIChannel[];

    this.fetchedGuild = (await this.rest.get(
      Routes.guild(this.opts.id)
    )) as APIGuild;

    const usersInOverrides = this.fetchedChannels
      .filter(
        (c) =>
          c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice
      )
      .map((c) => c as APITextChannel | APIGuildVoiceChannel)
      .flatMap((c) => c.permission_overwrites ?? [])
      .filter((o) => o.type === OverwriteType.Member)
      .map((m) => m.id);

    const users = await Promise.all(
      usersInOverrides.map((userId) => {
        return this.rest.get(Routes.user(userId)) as Promise<APIUser>;
      })
    );

    const userMapping = users.reduce<Record<string, APIUser>>((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    this.mappedUsers = userMapping;
    this.fetchedUsers = users;

    this.mappedChannels = this.fetchedChannels.reduce<
      Record<string, APIChannel>
    >((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    this.mappedRoles = this.fetchedGuild.roles.reduce<Record<string, APIRole>>(
      (acc, val) => {
        acc[val.id] = val;
        return acc;
      },
      {}
    );

    this.init = true;
  }

  fetchGlobalChannels(): Promise<GuildChannelWithOpts[]> {
    this.assertInitialised();

    return Promise.resolve(
      this.fetchedChannels
        .filter(
          (c) =>
            (c.type === ChannelType.GuildText ||
              c.type === ChannelType.GuildVoice) &&
            c.parent_id === null
        )
        .map((c) => {
          if (c.type === ChannelType.GuildText) {
            return {
              type: "text" as const,
              comment: c.name,
              id: c.id,
              parentId: undefined,
              predicate: () => true,
              options: {
                nsfw: c.nsfw ?? false,
                slowmode: c.rate_limit_per_user ?? 0,
                topic: c.topic ?? undefined,
              },
              overrides: this.overwritesToOverrides(
                c.permission_overwrites ?? []
              ),
            };
          }

          if (c.type === ChannelType.GuildVoice) {
            return {
              type: "voice" as const,
              comment: c.name,
              id: c.id,
              predicate: () => true,
              parentId: undefined,
              options: {
                nsfw: c.nsfw ?? false,
                bitrate: c.bitrate,
                userLimit: c.user_limit,
              },
              overrides: this.overwritesToOverrides(
                c.permission_overwrites ?? []
              ),
            };
          }

          assert(false, "impossible");
        })
    );
  }

  fetchRoles(): Promise<Role[]> {
    this.assertInitialised();
    return Promise.resolve(
      this.fetchedGuild.roles
        // Do not include managed roles, they are controlled by other bots
        .filter((r) => !r.managed)
        .map((r) => {
          // Disable all perms by default
          const permissions = { ...AllDisabledPerms };

          for (const truePerm of bitfieldToString(Number(r.permissions))) {
            // .. enable the ones specified
            permissions[truePerm.toLowerCase()] = true;
          }

          return {
            comment: r.name,
            options: {
              hoisted: r.hoist,
              colour: r.color,
              mentionableByEveryone: r.mentionable,
            },
            id: r.id,
            permissions,
          };
        })
    );
  }

  fetchCategories(): Promise<Category[]> {
    this.assertInitialised();
    const { mappedChannels } = this;

    type Accumulator = Record<string, Category>;
    type TextOrVoice = APITextChannel | APIGuildVoiceChannel;

    // Setup a category. This is called when we first encounter the category
    const setupCategory = (acc: Accumulator, val: TextOrVoice) => {
      // Validated by callers
      assert(val.parent_id, "no parent ID set");
      assert(!acc[val.parent_id], "category already set");

      const parent = mappedChannels[val.parent_id];
      if (parent.type !== ChannelType.GuildCategory) {
        throw new Error(
          `expected ChannelType.GuildCategory, got ${ChannelType[parent.type]}`
        );
      }

      // Role overrides for the category
      const roleOverrides: Override[] = this.overwritesToOverrides(
        parent.permission_overwrites ?? [],
        AllUndefinedPerms
      );

      acc[val.parent_id] = {
        id: val.parent_id,
        comment: parent.name,
        predicate: () => true,
        channels: [],
        overrides: roleOverrides,
      };
    };

    const setupText = (acc: Accumulator, val: APITextChannel) => {
      // Validated by callers
      assert(val.parent_id, "no parent ID set");

      acc[val.parent_id].channels.push({
        type: "text" as const,
        comment: val.name,
        id: val.id,
        parentId: val.parent_id,
        predicate: () => true,
        options: {
          nsfw: val.nsfw ?? false,
          slowmode: val.rate_limit_per_user ?? 0,
          topic: val.topic ?? undefined,
        },
        overrides: this.overwritesToOverrides(
          val.permission_overwrites ?? [],
          AllUndefinedPerms
        ),
      });
    };

    const setupVoice = (acc: Accumulator, val: APIGuildVoiceChannel) => {
      // Validated by callers
      assert(val.parent_id, "no parent ID set");

      acc[val.parent_id].channels.push({
        type: "voice" as const,
        comment: val.name,
        id: val.id,
        predicate: () => true,
        parentId: val.parent_id,
        options: {
          nsfw: val.nsfw ?? false,
          bitrate: val.bitrate,
          userLimit: val.user_limit,
        },
        overrides: this.overwritesToOverrides(
          val.permission_overwrites ?? [],
          AllUndefinedPerms
        ),
      });
    };

    const mappedCategories = this.fetchedChannels.reduce<Accumulator>(
      (acc, val) => {
        // Ignore other channel types
        if (
          !(
            val.type === ChannelType.GuildText ||
            val.type === ChannelType.GuildVoice
          )
        ) {
          return acc;
        }

        if (!val.parent_id) {
          return acc;
        }

        if (!(val.parent_id in acc)) {
          setupCategory(acc, val);
        }

        if (val.type === ChannelType.GuildText) {
          setupText(acc, val);
        }

        if (val.type === ChannelType.GuildVoice) {
          setupVoice(acc, val);
        }

        return acc;
      },
      {}
    );

    // It is easier to group up the channels with a mapping, but we do not need the mapping after the fact
    const categories = Object.values(mappedCategories);

    // Apply inheritance rules
    // We must do this ourselves because Discord "syncing" and "inheritance" are simply client terms
    // The API does not acknowledge this concept
    for (const category of categories) {
      for (const channel of category.channels) {
        inheritIntoChild(category, channel);
      }

      sortOverrides(category);
    }

    categories.sort(snowflakeSorter);

    return Promise.resolve(categories);
  }

  async pushChannel(channel: GuildChannelWithOpts): Promise<void> {
    const type = channel.type;
    let body = {};

    if (type === "voice") {
      body = {
        name: channel.comment,
        nsfw: channel.options.nsfw,
        bitrate: channel.options.bitrate,
        user_limit: channel.options.userLimit,
      };
    } else {
      body = {
        name: channel.comment,
        nsfw: channel.options.nsfw,
        topic: channel.options.topic,
        slowmode: channel.options.slowmode,
      };
    }

    const finalBody = {
      ...body,
      parent_id: channel.parentId,
      permission_overwrites: channel.overrides.map((r) => {
        let allow = 0n;
        let deny = 0n;

        for (const [perm, enabled] of Object.entries(r.permissions)) {
          if (enabled === true) {
            allow = allow | BigInt(stringToBitField(perm.toUpperCase()));
          } else if (enabled === false) {
            deny = deny | BigInt(stringToBitField(perm.toUpperCase()));
          }
          // Fall through for undefined (inherit)
        }

        return {
          id: r.id,
          type: r.type === "role" ? 0 : 1,
          allow: allow.toString(),
          deny: deny.toString(),
        };
      }),
    };

    finalBody.permission_overwrites.sort(snowflakeSorter);
    const mappedChannel = this.mappedChannels[channel.id];

    assert(
      mappedChannel.type === ChannelType.GuildText ||
        mappedChannel.type === ChannelType.GuildVoice ||
        mappedChannel.type === ChannelType.GuildCategory
    );

    mappedChannel.permission_overwrites?.sort(snowflakeSorter);

    const diff = deepDiff(
      finalBody.permission_overwrites,
      mappedChannel.permission_overwrites ?? []
    );

    if (!diff) {
      logger.debug(
        `Skipping channel ${channel.comment} (${channel.id}), no changes`
      );
      return;
    }

    logger.info(`Pushing channel: ${channel.comment}`);

    await this.rest.patch(Routes.channel(channel.id), {
      body: finalBody,
    });
  }

  async pushCategory(category: Category): Promise<void> {
    const body = {
      name: category.comment,
      permission_overwrites: category.overrides
        .map((r) => {
          let allow = 0n;
          let deny = 0n;

          for (const [perm, enabled] of Object.entries(r.permissions)) {
            if (enabled === true) {
              allow = allow | BigInt(stringToBitField(perm.toUpperCase()));
            } else if (enabled === false) {
              deny = deny | BigInt(stringToBitField(perm.toUpperCase()));
            }
          }

          return {
            id: r.id,
            type: r.type === "role" ? 0 : 1,
            allow: allow.toString(),
            deny: deny.toString(),
          };
        })
        .sort(snowflakeSorter),
    };

    const mappedChannel = this.mappedChannels[category.id];
    assert(mappedChannel.type === ChannelType.GuildCategory);
    mappedChannel.permission_overwrites?.sort(snowflakeSorter);

    const catOverrides = deepDiff(
      body.permission_overwrites,
      mappedChannel.permission_overwrites ?? []
    );

    if (!catOverrides) {
      logger.debug(
        `Skipping category ${category.comment} (${category.id}), no changes`
      );
      return;
    }

    logger.info(`Pushing category: ${category.comment}`);

    await this.rest.patch(Routes.channel(category.id), {
      body,
    });
  }

  async pushRole(role: Role): Promise<void> {
    this.assertInitialised();
    let permissions = 0n;

    for (const [perm, enabled] of Object.entries(role.permissions)) {
      // Do not set the bit if the perm is not true (Discord requires us to publish the whole perm, not just a diff)
      if (enabled) {
        const bits = BigInt(stringToBitField(perm.toUpperCase()));
        permissions = permissions | bits;
      }
    }

    const mappedRole = this.mappedRoles[role.id];

    if (
      mappedRole.permissions === permissions.toString() &&
      mappedRole.hoist === role.options.hoisted &&
      mappedRole.color === role.options.colour &&
      mappedRole.mentionable === role.options.mentionableByEveryone
    ) {
      logger.debug(`Skipping role ${role.comment} (${role.id}), no changes`);
      return;
    }

    logger.info(`Pushing role: ${role.comment}`);

    await this.rest.patch(Routes.guildRole(this.opts.id, role.id), {
      body: {
        name: role.comment,
        permissions: permissions.toString(),

        hoist: role.options.hoisted,
        color: role.options.colour,
        mentionable: role.options.mentionableByEveryone,
      },
    });
  }

  private overwritesToOverrides(
    overwrites: APIOverwrite[],
    defaults: Record<string, boolean | undefined> = {}
  ): Override[] {
    this.assertInitialised();
    return overwrites
      .map((p) => {
        const allowed = bitfieldToString(Number(p.allow)).reduce<
          Record<string, true>
        >((acc, val) => {
          acc[val.toLowerCase()] = true;
          return acc;
        }, {});

        const denied = bitfieldToString(Number(p.deny)).reduce<
          Record<string, false>
        >((acc, val) => {
          acc[val.toLowerCase()] = false;
          return acc;
        }, {});

        // TODO: Clean this up
        return {
          id: p.id,
          type:
            p.type === OverwriteType.Member
              ? ("user" as const)
              : ("role" as const),
          comment:
            p.type === OverwriteType.Member
              ? this.mappedUsers[p.id].username
              : this.mappedRoles[p.id].name,
          permissions: { ...defaults, ...allowed, ...denied },
        };
      })
      .sort(snowflakeSorter);
  }
}

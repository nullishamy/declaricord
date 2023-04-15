import { AllDisabledPerms } from "../backend/permissions.js";
import { z } from "zod";

export const RoleOverride = z
  .object({
    id: z.string(),
    comment: z.string(),

    permissions: z.any(),
  })
  .catchall(z.boolean().or(z.undefined()))
  .transform((data) => {
    const { id, comment, permissions, ..._permissions } = data;

    return {
      id,
      comment,
      permissions: _permissions,
    };
  });

const OverrideArray = z
  .union([z.array(RoleOverride), z.object({})])
  .default([]);

export const VoiceChannel = z.object({
  id: z.string(),
  comment: z.string(),
  type: z.literal("voice").default("voice"),

  nsfw: z.boolean().default(false),
  bitrate: z.number().or(z.undefined()),
  user_limit: z.number().or(z.undefined()),
  overrides: OverrideArray,
});

export const TextChannel = z.object({
  id: z.string(),
  comment: z.string(),
  topic: z.string().optional(),
  type: z.literal("text").default("text"),

  nsfw: z.boolean().default(false),
  slowmode: z.number().default(0),
  overrides: OverrideArray,
});

export const TextChannelWithOpts = TextChannel.transform((data) => {
  const { id, comment, topic, nsfw, slowmode, overrides } = data;

  return {
    id,
    comment,
    type: "text" as const,
    options: {
      nsfw,
      topic,
      slowmode,
    },
    overrides: !Array.isArray(overrides) ? [] : overrides,
  };
});

export const VoiceChannelWithOpts = VoiceChannel.transform((data) => {
  const { id, comment, nsfw, bitrate, user_limit, overrides } = data;

  return {
    id,
    comment,
    type: "voice" as const,
    options: {
      nsfw,
      bitrate,
      userLimit: user_limit,
    },
    overrides: !Array.isArray(overrides) ? [] : overrides,
  };
});

export const GuildChannel = z
  .discriminatedUnion("type", [VoiceChannel, TextChannel])
  .transform((data) => {
    if (data.type === "text") {
      const { id, comment, topic, nsfw, slowmode, overrides } = data;

      return {
        id,
        comment,
        type: "text" as const,
        options: {
          nsfw,
          topic,
          slowmode,
        },
        overrides: !Array.isArray(overrides) ? [] : overrides,
      };
    } else if (data.type === "voice") {
      const { id, comment, nsfw, bitrate, user_limit, overrides } = data;

      return {
        id,
        comment,
        type: "voice" as const,
        options: {
          nsfw,
          bitrate,
          userLimit: user_limit,
        },
        overrides: !Array.isArray(overrides) ? [] : overrides,
      };
    }

    throw "impossible";
  });

export const Role = z
  .object({
    id: z.string(),
    comment: z.string(),
  })
  .catchall(z.boolean().or(z.undefined()))
  .transform((data) => {
    const { id, comment, ...permissions } = data;
    const defaultedPermissions = { ...AllDisabledPerms, ...permissions };

    return {
      id,
      comment,
      permissions: defaultedPermissions,
    };
  });

export const Category = z.object({
  id: z.string(),
  comment: z.string(),
  channels: z.array(GuildChannel),
  overrides: OverrideArray.transform((data) =>
    !Array.isArray(data) ? [] : data
  ),
});

export type TextChannel = z.infer<typeof TextChannel>;
export type VoiceChannel = z.infer<typeof VoiceChannel>;
export type TextChannelWithOpts = z.infer<typeof TextChannelWithOpts>;
export type VoiceChannelWithOpts = z.infer<typeof VoiceChannelWithOpts>;
export type GuildChannel = z.infer<typeof GuildChannel>;
export type RoleOverride = z.infer<typeof RoleOverride>;
export type Role = z.infer<typeof Role>;
export type Category = z.infer<typeof Category>;

export type GuildConfiguration = {
  guildId: string;
  globalRoles: Role[];
  globalChannels: GuildChannel[];
  categories: Category[];
};

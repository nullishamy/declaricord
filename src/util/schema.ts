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
    const { id, comment, ..._permissions } = data;

    return {
      id,
      comment,
      permissions: _permissions,
    };
  });

const OverrideArray = z
  .union([z.array(RoleOverride), z.object({})])
  .default([]);

type OverrideArray = z.infer<typeof OverrideArray>;

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? ([] as RoleOverride[])
    : overrides;

  return {
    id,
    comment,
    type: "text" as const,
    options: {
      nsfw,
      topic,
      slowmode,
    },
    overrides: typedOverrides,
  };
});

export const VoiceChannelWithOpts = VoiceChannel.transform((data) => {
  const { id, comment, nsfw, bitrate, user_limit, overrides } = data;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? []
    : overrides;

  return {
    id,
    comment,
    type: "voice" as const,
    options: {
      nsfw,
      bitrate,
      userLimit: user_limit,
    },
    overrides: typedOverrides,
  };
});

export const GuildChannel = z.discriminatedUnion("type", [
  VoiceChannel,
  TextChannel,
]);

export const GuildChannelWithOpts = GuildChannel.transform((data) => {
  if (data.type === "text") {
    const { id, comment, topic, nsfw, slowmode, overrides } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
      ? []
      : overrides;

    return {
      id,
      comment,
      type: "text" as const,
      options: {
        nsfw,
        topic,
        slowmode,
      },
      overrides: typedOverrides,
    };
  } else {
    const { id, comment, nsfw, bitrate, user_limit, overrides } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
      ? []
      : overrides;

    return {
      id,
      comment,
      type: "voice" as const,
      options: {
        nsfw,
        bitrate,
        userLimit: user_limit,
      },
      overrides: typedOverrides,
    };
  }
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
  channels: z.array(GuildChannelWithOpts),
  overrides: OverrideArray.transform((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: RoleOverride[] = !Array.isArray(data) ? [] : data;
    return typedOverrides;
  }),
});

export type TextChannel = z.infer<typeof TextChannel>;
export type VoiceChannel = z.infer<typeof VoiceChannel>;
export type TextChannelWithOpts = z.infer<typeof TextChannelWithOpts>;
export type VoiceChannelWithOpts = z.infer<typeof VoiceChannelWithOpts>;
export type GuildChannel = z.infer<typeof GuildChannel>;
export type GuildChannelWithOpts = z.infer<typeof GuildChannelWithOpts>;
export type RoleOverride = z.infer<typeof RoleOverride>;
export type Role = z.infer<typeof Role>;
export type Category = z.infer<typeof Category>;
/* eslint-enable @typescript-eslint/no-redeclare */

export interface GuildConfiguration {
  guildId: string;
  globalRoles: Role[];
  globalChannels: GuildChannelWithOpts[];
  categories: Category[];
}

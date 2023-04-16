import { AllDisabledPerms, AllUndefinedPerms } from "../backend/permissions.js";
import { z } from "zod";

const Id = z.string().regex(/^\d{17,19}$/);
const Comment = z.string().min(1).max(100)

export const RoleOverride = z
  .object({
    id: Id,
    comment: Comment,

    permissions: z.any(),
  })
  .catchall(z.boolean().or(z.undefined()))
  .transform((data) => {
    const { id, comment, ..._permissions } = data;
    const nulledPermissions = { ...AllUndefinedPerms, ..._permissions}

    return {
      id,
      comment,
      permissions: nulledPermissions,
    };
  });

const OverrideArray = z
  .union([z.array(RoleOverride), z.object({})])
  .default([]);

type OverrideArray = z.infer<typeof OverrideArray>;

export const VoiceChannel = z.object({
  id: Id,
  parentId: Id.optional(),
  comment: Comment,
  type: z.literal("voice").default("voice"),

  nsfw: z.boolean().default(false),
  bitrate: z.number().or(z.undefined()),
  user_limit: z.number().or(z.undefined()),
  overrides: OverrideArray,
});

export const TextChannel = z.object({
  id: Id,
  parentId: Id.optional(),
  comment: Comment,
  topic: z.string().max(4096).optional(),
  type: z.literal("text").default("text"),

  nsfw: z.boolean().default(false),
  slowmode: z.number().default(0),
  overrides: OverrideArray,
});

export const TextChannelWithOpts = TextChannel.transform((data) => {
  const { id, comment, topic, nsfw, parentId, slowmode, overrides } = data;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? ([] as RoleOverride[])
    : overrides;

  return {
    id,
    parentId,
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
  const { id, comment, nsfw, bitrate, user_limit, parentId, overrides } = data;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? []
    : overrides;

  return {
    id,
    parentId,
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
    const { id, comment, topic, nsfw, parentId, slowmode, overrides } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
      ? []
      : overrides;

    return {
      id,
      parentId,
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
    const { id, comment, nsfw, bitrate, parentId, user_limit, overrides } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
      ? []
      : overrides;

    return {
      id,
      parentId,
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
    id: Id,
    comment: Comment,
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

export const Category = z
  .object({
    id: Id,
    comment: Comment,
    channels: z.array(GuildChannelWithOpts),
    overrides: OverrideArray.transform((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const typedOverrides: RoleOverride[] = !Array.isArray(data) ? [] : data;
      return typedOverrides;
    }),
  })
  .transform((data) => {
    data.channels = data.channels.map((c) => ({
      ...c,
      parentId: data.id,
    }));

    return data
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

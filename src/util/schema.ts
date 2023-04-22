import { AllDisabledPerms, AllUndefinedPerms } from "../backend/permissions.js";
import { z } from "zod";

const Id = z.string().regex(/^\d{17,19}$/);
const Comment = z.string().min(1).max(100);

export const RoleOverride = z
  .object({
    id: Id,
    comment: Comment,
    type: z.literal("role").default("role"),
  })
  .catchall(z.boolean().or(z.undefined()))
  .transform((data) => {
    const { id, comment, type, ..._permissions } = data;
    const nulledPermissions = { ...AllUndefinedPerms, ..._permissions };

    return {
      id,
      type,
      comment,
      permissions: nulledPermissions,
    };
  });

export const UserOverride = z
  .object({
    id: Id,
    comment: Comment,
    type: z.literal("user").default("user"),
  })
  .catchall(z.boolean().or(z.undefined()))
  .transform((data) => {
    const { id, comment, type, ..._permissions } = data;
    const nulledPermissions = { ...AllUndefinedPerms, ..._permissions };

    return {
      id,
      type: type,
      comment,
      permissions: nulledPermissions,
    };
  });

export const Override = z.union([UserOverride, RoleOverride]);
export type Override = z.infer<typeof Override>;

const OverrideArray = z.union([z.array(Override), z.object({})]).default([]);
type OverrideArray = z.infer<typeof OverrideArray>;

export const VoiceChannel = z.object({
  id: Id,
  parentId: Id.optional(),
  comment: Comment,
  type: z.literal("voice").default("voice"),

  predicate: z.function().returns(z.boolean()).optional(),
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

  predicate: z.function().returns(z.boolean()).optional(),
  nsfw: z.boolean().default(false),
  slowmode: z.number().default(0),
  overrides: OverrideArray,
});

export const TextChannelWithOpts = TextChannel.transform((data) => {
  const { id, comment, topic, nsfw, parentId, predicate, slowmode, overrides } =
    data;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? ([] as RoleOverride[])
    : overrides;

  return {
    id,
    parentId,
    comment,
    type: "text" as const,
    predicate: predicate ?? (() => true),
    options: {
      nsfw,
      topic,
      slowmode,
    },
    overrides: typedOverrides,
  };
});

export const VoiceChannelWithOpts = VoiceChannel.transform((data) => {
  const {
    id,
    comment,
    nsfw,
    bitrate,
    predicate,
    user_limit,
    parentId,
    overrides,
  } = data;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? []
    : overrides;

  return {
    id,
    parentId,
    comment,
    type: "voice" as const,
    predicate: predicate ?? (() => true),
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
    const {
      id,
      comment,
      topic,
      nsfw,
      predicate,
      parentId,
      slowmode,
      overrides,
    } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: Override[] = !Array.isArray(overrides)
      ? []
      : overrides;

    return {
      id,
      parentId,
      comment,
      predicate: predicate ?? (() => true),
      type: "text" as const,
      options: {
        nsfw,
        topic,
        slowmode,
      },
      overrides: typedOverrides,
    };
  } else {
    const {
      id,
      comment,
      nsfw,
      bitrate,
      predicate,
      parentId,
      user_limit,
      overrides,
    } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: Override[] = !Array.isArray(overrides)
      ? []
      : overrides;

    return {
      id,
      parentId,
      comment,
      predicate: predicate ?? (() => true),
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

    hoisted: z.boolean().default(false),
    colour: z.number().default(0),
    mentionable: z.boolean().default(false),
  })
  .catchall(z.boolean().or(z.undefined()))
  .transform((data) => {
    const { id, comment, hoisted, colour, mentionable, ...permissions } = data;
    const defaultedPermissions = { ...AllDisabledPerms, ...permissions };

    return {
      id,
      comment,
      options: {
        hoisted,
        colour,
        mentionableByEveryone: mentionable,
      },
      permissions: defaultedPermissions,
    };
  });

export const Category = z
  .object({
    id: Id,
    comment: Comment,
    predicate: z.function().returns(z.boolean()).optional(),
    channels: z
      .array(GuildChannelWithOpts)
      .or(z.object({}))
      .transform((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const typedArray: GuildChannelWithOpts[] = !Array.isArray(data)
          ? []
          : data;
        return typedArray;
      }),
    overrides: OverrideArray.transform((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const typedOverrides: Override[] = !Array.isArray(data) ? [] : data;
      return typedOverrides;
    }),
  })
  .transform((data) => {
    return {
      ...data,
      channels: data.channels.map((c) => ({
        ...c,
        parentId: data.id,
      })),
      predicate: data.predicate ?? (() => true),
    };
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

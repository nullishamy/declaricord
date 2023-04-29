import { AllDisabledPerms, AllUndefinedPerms } from "../backend/permissions.js";
import { z } from "zod";

const Id = z.string().regex(/^\d{17,19}$/);
const Comment = z.string().min(1).max(100);
const Predicate = z.function().returns(z.boolean()).optional();

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

  predicate: Predicate,
  nsfw: z.boolean().default(false),
  bitrate: z.number().or(z.undefined()),
  user_limit: z.number().or(z.undefined()),
  overrides: OverrideArray,
});

export const TextChannel = z.object({
  id: Id,
  parentId: Id.optional(),
  comment: Comment,
  topic: z.string().max(1024).optional(),
  type: z.literal("text").default("text"),

  predicate: Predicate,
  nsfw: z.boolean().default(false),
  slowmode: z.number().default(0),
  overrides: OverrideArray,
  thread_slowmode: z.number().default(0),
});

// Snowflake of custom ID, or unicode emoji, or undefined (none)
const TagEmoji = z.object({
  type: z.literal("unicode").or(z.literal("custom")),
  value: z.string().nonempty(),
});

export const ForumTag = z.object({
  id: Id,
  comment: z.string().max(20),
  mod_only: z.boolean().default(false),
  emoji: TagEmoji.optional(),
});

export const ForumChannel = z.object({
  id: Id,
  parentId: Id.optional(),
  comment: Comment,
  topic: z.string().max(4096).optional(),
  slowmode: z.number().default(0),
  type: z.literal("forum").default("forum"),
  predicate: z.function().returns(z.boolean()).optional(),
  nsfw: z.boolean().default(false),
  overrides: OverrideArray,
  tags: z.union([z.array(ForumTag), z.object({})]).default([]),
  thread_slowmode: z.number().default(0),
});

export const TextChannelWithOpts = TextChannel.transform((data) => {
  const {
    id,
    comment,
    topic,
    nsfw,
    parentId,
    predicate,
    slowmode,
    overrides,
    thread_slowmode,
  } = data;

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
      defaultThreadSlowmode: thread_slowmode,
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

export const ForumChannelWithOpts = ForumChannel.transform((data) => {
  const {
    id,
    comment,
    nsfw,
    predicate,
    slowmode,
    parentId,
    overrides,
    tags,
    thread_slowmode,
    topic,
  } = data;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedOverrides: RoleOverride[] = !Array.isArray(overrides)
    ? []
    : overrides;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const typedTags: ForumTag[] = !Array.isArray(tags) ? [] : tags;

  return {
    id,
    parentId,
    comment,
    type: "forum" as const,
    predicate: predicate ?? (() => true),
    options: {
      nsfw,
      defaultThreadSlowmode: thread_slowmode,
      topic,
      slowmode,
    },
    overrides: typedOverrides,
    tags: typedTags,
  };
});

export const GuildChannel = z.discriminatedUnion("type", [
  VoiceChannel,
  TextChannel,
  ForumChannel,
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
      thread_slowmode,
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
        defaultThreadSlowmode: thread_slowmode,
      },
      overrides: typedOverrides,
    };
  } else if (data.type === "forum") {
    const {
      id,
      comment,
      topic,
      nsfw,
      predicate,
      parentId,
      slowmode,
      tags,
      thread_slowmode,
      overrides,
    } = data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedOverrides: Override[] = !Array.isArray(overrides)
      ? []
      : overrides;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const typedTags: ForumTag[] = !Array.isArray(tags) ? [] : tags;

    return {
      id,
      parentId,
      comment,
      predicate: predicate ?? (() => true),
      type: "forum" as const,
      options: {
        nsfw,
        defaultThreadSlowmode: thread_slowmode,
        topic,
        slowmode,
      },
      tags: typedTags,
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

export const GuildConfiguration = z.object({
  guildId: z.string(),
  globalRoles: z.array(Role),
  globalChannels: z.array(GuildChannelWithOpts),
  categories: z.array(Category),
});

export type TextChannel = z.infer<typeof TextChannel>;
export type VoiceChannel = z.infer<typeof VoiceChannel>;
export type ForumChannel = z.infer<typeof ForumChannel>;
export type ForumChannelWithOpts = z.infer<typeof ForumChannelWithOpts>;
export type TextChannelWithOpts = z.infer<typeof TextChannelWithOpts>;
export type VoiceChannelWithOpts = z.infer<typeof VoiceChannelWithOpts>;
export type GuildChannel = z.infer<typeof GuildChannel>;
export type GuildChannelWithOpts = z.infer<typeof GuildChannelWithOpts>;
export type RoleOverride = z.infer<typeof RoleOverride>;
export type Role = z.infer<typeof Role>;
export type ForumTag = z.infer<typeof ForumTag>;
export type Category = z.infer<typeof Category>;
export type GuildConfiguration = z.infer<typeof GuildConfiguration>;
/* eslint-enable @typescript-eslint/no-redeclare */

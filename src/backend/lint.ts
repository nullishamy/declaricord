import {
  Category,
  GuildChannelWithOpts,
  GuildConfiguration,
  Role,
} from "../util/schema.js";

export type LintSeverity = "info" | "warning" | "fatal";

export interface LintEntry {
  identifier: string;
  message: string;
  severity: LintSeverity;
}

function lintChannel(channel: GuildChannelWithOpts) {
  const out: LintEntry[] = [];

  if (channel.type === "text") {
    if (!channel.options.topic) {
      out.push({
        identifier: `channel: ${channel.comment} (${channel.id})`,
        message: "consider setting a topic",
        severity: "info",
      });
    }
  } else {
  }

  return out;
}

function lintRole(role: Role) {
  const out: LintEntry[] = [];

  if (role.comment === "@everyone") {
    // Warn about administrative permissions on @everyone
    const dangerousEveryonePerms = [
      "manage_channels",
      "manage_guild",
      "manage_messages",
      "manage_roles",
      "manage_webhooks",
      "kick_members",
      "ban_members",
      "moderate_members", // Timeouts
      "mention_everyone",
    ];

    for (const perm of dangerousEveryonePerms) {
      if (role.permissions[perm]) {
        out.push({
          identifier: `role: ${role.comment} (${role.id})`,
          message: `the ${perm} permission is dangerous to grant to @everyone, did you mean to?`,
          severity: "warning",
        });
      }
    }
  }

  if (role.permissions.administrator) {
    out.push({
      identifier: `role: ${role.comment} (${role.id})`,
      message:
        "the administrator permission is dangerous to grant, do it with caution",
      severity: "warning",
    });
  }

  return out;
}

function lintCategory(category: Category) {
  const out: LintEntry[] = [];
  if (!category.channels.length) {
    out.push({
      identifier: `category ${category.comment} (${category.id})`,
      message: "no channels found in this category, is that intentional?",
      severity: "info",
    });
  }
  return out;
}

export function lintConfig(config: GuildConfiguration): LintEntry[] {
  const lints = [
    ...config.globalRoles.map(lintRole).flat(),
    ...config.globalChannels.map(lintChannel).flat(),
    ...config.categories.map(lintCategory).flat(),
  ];
  const atEveryone = config.globalRoles.find((r) => r.comment === "@everyone");

  if (!atEveryone) {
    lints.push({
      identifier: `role: @everyone`,
      message: `the @everyone role is not defined, you should define it`,
      severity: "fatal",
    });
  }

  return lints;
}

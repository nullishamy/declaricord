import { REST } from '@discordjs/rest'
import assert from 'assert'
import {
  APIChannel,
  APIGuild,
  APIOverwrite,
  APIRole,
  ChannelType,
  Routes
} from 'discord-api-types/v10'
import { Category, GuildChannelWithOpts, Role, RoleOverride } from '../util/schema.js'
import {
  AllDisabledPerms,
  bitfieldToString,
  stringToBitField
} from './permissions.js'

export abstract class API {
  public static VERSION = '10'

  protected readonly rest: REST
  constructor (protected readonly guildId: string, token: string) {
    this.rest = new REST({ version: API.VERSION }).setToken(token)
  }

  abstract fetchGlobalChannels (): Promise<GuildChannelWithOpts[]>
  abstract fetchRoles (): Promise<Role[]>
  abstract fetchCategories (): Promise<Category[]>

  abstract pushChannel (channel: GuildChannelWithOpts): Promise<void>
  abstract pushCategory (category: Category): Promise<void>
  abstract pushRole (role: Role): Promise<void>
}

export class APIImpl extends API {
  private fetchedGuild: APIGuild | undefined
  private fetchedChannels: APIChannel[] | undefined

  private mappedRoles: Record<string, APIRole> | undefined
  private mappedChannels: Record<string, APIChannel> | undefined

  async fetchGlobalChannels (): Promise<GuildChannelWithOpts[]> {
    const channels: APIChannel[] =
      this.fetchedChannels ??
      ((await this.rest.get(
        Routes.guildChannels(this.guildId)
      )) as APIChannel[])
    this.fetchedChannels = channels
    await this.fetchRoles()

    this.applyMappings()

    assert(this.mappedRoles)

    const mappedRoles = this.mappedRoles

    return this.fetchedChannels
      .filter(
        (c) =>
          (c.type === ChannelType.GuildText ||
            c.type === ChannelType.GuildVoice) &&
          c.parent_id === null
      )
      .map((c) => {
        if (c.type === ChannelType.GuildText) {
          return {
            type: 'text' as const,
            comment: c.name,
            id: c.id,
            parentId: undefined,
            options: {
              nsfw: c.nsfw ?? false,
              slowmode: c.rate_limit_per_user ?? 0,
              topic: c.topic ?? undefined
            },
            overrides: this.roleOverwritesToOverrides(
              c.permission_overwrites ?? [],
              mappedRoles
            )
          }
        }

        if (c.type === ChannelType.GuildVoice) {
          return {
            type: 'voice' as const,
            comment: c.name,
            id: c.id,
            parentId: undefined,
            options: {
              nsfw: c.nsfw ?? false,
              bitrate: c.bitrate,
              userLimit: c.user_limit
            },
            overrides: this.roleOverwritesToOverrides(
              c.permission_overwrites ?? [],
              mappedRoles
            )
          }
        }

        assert(false, 'impossible')
      })
  }

  async fetchRoles (): Promise<Role[]> {
    const guild =
      this.fetchedGuild ??
      ((await this.rest.get(Routes.guild(this.guildId))) as APIGuild)
    this.fetchedGuild = guild
    this.applyMappings()

    return (
      this.fetchedGuild.roles
        // Do not include managed roles, they are controlled by other bots
        .filter((r) => !r.managed)
        .map((r) => {
          // Disable all perms by default
          const permissions = { ...AllDisabledPerms }

          for (const truePerm of bitfieldToString(Number(r.permissions))) {
            // .. enable the ones specified
            permissions[truePerm.toLowerCase()] = true
          }

          return {
            comment: r.name,
            id: r.id,
            permissions
          }
        })
    )
  }

  async fetchCategories (): Promise<Category[]> {
    await this.fetchGlobalChannels()
    await this.fetchRoles()
    this.applyMappings()

    assert(this.fetchedChannels)
    assert(this.mappedRoles)
    assert(this.mappedChannels)

    const { mappedRoles, mappedChannels } = this

    // It is easier to group up the channels with a mapping, but we do not need the mapping after the fact
    return Object.values(
      this.fetchedChannels.reduce<Record<string, Category>>((acc, val) => {
        if (
          val.type === ChannelType.GuildText ||
          val.type === ChannelType.GuildVoice
        ) {
          if (!val.parent_id) {
            return acc
          }

          if (!(val.parent_id in acc)) {
            const parent = mappedChannels[val.parent_id]
            if (parent.type !== ChannelType.GuildCategory) {
              throw new Error(`expected ChannelType.GuildCategory, got ${ChannelType[parent.type]}`)
            }

            // Role overrides for the category
            const roleOverrides: RoleOverride[] =
              this.roleOverwritesToOverrides(
                parent.permission_overwrites ?? [],
                mappedRoles
              )

            acc[val.parent_id] = {
              id: val.parent_id,
              comment: parent.name,
              channels: [],
              overrides: roleOverrides
            }
          }

          if (val.type === ChannelType.GuildText) {
            acc[val.parent_id].channels.push({
              type: 'text' as const,
              comment: val.name,
              id: val.id,
              parentId: val.parent_id,
              options: {
                nsfw: val.nsfw ?? false,
                slowmode: val.rate_limit_per_user ?? 0,
                topic: val.topic ?? undefined
              },
              overrides: this.roleOverwritesToOverrides(
                val.permission_overwrites ?? [],
                mappedRoles
              )
            })
          }

          if (val.type === ChannelType.GuildVoice) {
            acc[val.parent_id].channels.push({
              type: 'voice' as const,
              comment: val.name,
              id: val.id,
              parentId: val.parent_id,
              options: {
                nsfw: val.nsfw ?? false,
                bitrate: val.bitrate,
                userLimit: val.user_limit
              },
              overrides: this.roleOverwritesToOverrides(
                val.permission_overwrites ?? [],
                mappedRoles
              )
            })
          }
        }
        return acc
      }, {})
    )
  }

  async pushChannel (channel: GuildChannelWithOpts): Promise<void> {
    const type = channel.type
    let body: Record<string, unknown> = {}

    if (type === 'voice') {
      body = {
        name: channel.comment,
        nsfw: channel.options.nsfw,
        bitrate: channel.options.bitrate,
        user_limit: channel.options.userLimit
      }
    } else {
      body = {
        name: channel.comment,
        nsfw: channel.options.nsfw,
        topic: channel.options.topic,
        slowmode: channel.options.slowmode
      }
    }

    body.permission_overwrites = channel.overrides.map((r) => {
      let allow = 0n
      let deny = 0n

      for (const [perm, enabled] of Object.entries(r.permissions)) {
        if (enabled) {
          allow = allow | BigInt(stringToBitField(perm.toUpperCase()))
        } else {
          deny = deny | BigInt(stringToBitField(perm.toUpperCase()))
        }
      }

      return {
        id: r.id,
        type: 0, // Always role overrides,
        allow: allow.toString(),
        deny: deny.toString()
      }
    })

    await this.rest.patch(Routes.channel(channel.id), {
      body
    })
  }

  async pushCategory (category: Category): Promise<void> {
    const body = {
      name: category.comment,
      permission_overwrites: category.overrides.map((r) => {
        let allow = 0n
        let deny = 0n

        for (const [perm, enabled] of Object.entries(r.permissions)) {
          if (enabled) {
            allow = allow | BigInt(stringToBitField(perm.toUpperCase()))
          } else {
            deny = deny | BigInt(stringToBitField(perm.toUpperCase()))
          }
        }

        return {
          id: r.id,
          type: 0, // Always role overrides,
          allow: allow.toString(),
          deny: deny.toString()
        }
      })
    }

    await this.rest.patch(Routes.channel(category.id), {
      body
    })
  }

  async pushRole (role: Role): Promise<void> {
    let permissions = 0n

    for (const [perm, enabled] of Object.entries(role.permissions)) {
      // Do not set the bit if the perm is not true (Discord requires us to publish the whole perm, not just a diff)
      if (enabled) {
        const bits = BigInt(stringToBitField(perm.toUpperCase()))
        permissions = permissions | bits
      }
    }

    await this.rest.patch(Routes.guildRole(this.guildId, role.id), {
      body: {
        name: role.comment,
        permissions: permissions.toString()
      }
    })
  }

  private roleOverwritesToOverrides (
    overwrites: APIOverwrite[],
    roleMapping: Record<string, APIRole>
  ): RoleOverride[] {
    return overwrites
      .map((p) => {
        const allowed = bitfieldToString(Number(p.allow)).reduce<Record<string, true>>((acc, val) => {
          acc[val.toLowerCase()] = true
          return acc
        }, {})

        const denied = bitfieldToString(Number(p.deny)).reduce<Record<string, false>>((acc, val) => {
          acc[val.toLowerCase()] = false
          return acc
        }, {})

        return {
          id: p.id,
          comment: roleMapping[p.id].name,
          permissions: { ...allowed, ...denied }
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  private applyMappings () {
    assert(this.fetchedChannels)
    assert(this.fetchedGuild)

    this.mappedChannels = this.fetchedChannels.reduce<Record<string, APIChannel>>((acc, val) => {
      acc[val.id] = val
      return acc
    }, {})

    this.mappedRoles = this.fetchedGuild.roles.reduce<Record<string, APIRole>>((acc, val) => {
      acc[val.id] = val
      return acc
    }, {})
  }
}

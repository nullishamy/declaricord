import { Category, Channel, GuildConfiguration, Role, RoleOverride, TextChannel, VoiceChannel } from "../frontend/data.js";
import { REST } from '@discordjs/rest';
import { APIChannel, APIGuild, APIGuildCategoryChannel, APIGuildChannel, APIGuildTextChannel, APIGuildVoiceChannel, APIRole, ChannelType, Routes } from 'discord-api-types/v10';
import { AllDisabledPerms, bitfieldToString, Permissions, stringToBitField } from "./permissions.js";

export class Client {
    private rest: REST

    private fetchedChannels: APIChannel[]
    private fetchedGuild: APIGuild

    private mappedChannels: Record<string, APIChannel>
    private mappedRoles: Record<string, APIRole>

    constructor(token: string) {
        this.rest = new REST({ version: '10' }).setToken(token);
    }

    private textOpts(channel: APIGuildTextChannel<ChannelType.GuildText>): TextChannel['options'] {
        return {
            topic: channel.topic ?? undefined,
            nsfw: channel.nsfw ?? false,
            slowmode: channel.rate_limit_per_user ?? 0
        }
    }
    private voiceOpts(channel: APIGuildVoiceChannel): VoiceChannel['options'] {
        return {
            nsfw: channel.nsfw ?? false,
            bitrate: channel.bitrate ?? 0,
            userLimit: channel.user_limit ?? 0
        }
    }

    private getChannelPermissions(channel: APIGuildCategoryChannel | APIGuildVoiceChannel | APIGuildTextChannel<ChannelType.GuildText>): RoleOverride[] {
        const perms = channel.permission_overwrites ?? []

        return perms.map(p => {
            const allowed = bitfieldToString(Number(p.allow)).reduce((acc, val) => {
                acc[val.toLowerCase()] = true
                return acc
            }, {} as Record<string, true>)

            const denied = bitfieldToString(Number(p.deny)).reduce((acc, val) => {
                acc[val.toLowerCase()] = false
                return acc
            }, {} as Record<string, false>)

            return {
                id: p.id,
                comment: this.mappedRoles[p.id]!.name,
                type: 'role' as const,
                permissions: { ...allowed, ...denied }
            }
        }).sort((a, b) => a.id.localeCompare(b.id))
    }

    private categoryMapping() {
        return this.fetchedChannels.reduce((acc, val) => {
            if (val.type === ChannelType.GuildText || val.type === ChannelType.GuildVoice) {
                if (!val.parent_id) {
                    return acc
                }

                if (!acc[val.parent_id]) {
                    const parent = this.mappedChannels![val.parent_id]
                    if (parent.type !== ChannelType.GuildCategory) {
                        throw 1
                    }

                    // Role overrides for the category 
                    const roleOverrides: RoleOverride[] = this.getChannelPermissions(parent)

                    acc[val.parent_id] = {
                        id: val.parent_id,
                        comment: parent.name,
                        type: 'category',
                        channels: [],
                        overrides: roleOverrides,
                    }
                }

                if (val.type === ChannelType.GuildText) {
                    acc[val.parent_id].channels.push({
                        type: 'channel' as const,
                        channel_type: 'text',
                        comment: val.name,
                        id: val.id,
                        options: this.textOpts(val),
                        overrides: this.getChannelPermissions(val),
                    })
                }

                if (val.type === ChannelType.GuildVoice) {
                    acc[val.parent_id].channels.push({
                        type: 'channel' as const,
                        channel_type: 'voice',
                        comment: val.name,
                        id: val.id,
                        options: this.voiceOpts(val),
                        overrides: this.getChannelPermissions(val),
                    })
                }
            }
            return acc
        }, {} as Record<string, Category>)
    }

    private setMappings() {
        this.mappedChannels = this.fetchedChannels.reduce((acc, val) => {
            acc[val.id] = val
            return acc
        }, {} as Record<string, APIChannel>)

        this.mappedRoles = this.fetchedGuild.roles.reduce((acc, val) => {
            acc[val.id] = val
            return acc
        }, {} as Record<string, APIRole>)
    }

    private globalChannels() {
        return this.fetchedChannels
            .filter(c => (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) && c.parent_id === null)
            .map(c => {
                if (c.type === ChannelType.GuildText) {
                    return {
                        type: 'channel' as const,
                        channel_type: 'text' as const,
                        comment: c.name,
                        id: c.id,
                        options: this.textOpts(c),
                        overrides: this.getChannelPermissions(c),
                    }
                }

                if (c.type === ChannelType.GuildVoice) {
                    return {
                        type: 'channel' as const,
                        channel_type: 'voice' as const,
                        comment: c.name,
                        id: c.id,
                        options: this.voiceOpts(c),
                        overrides: this.getChannelPermissions(c),
                    }
                }

                throw 'impossible'
            })
    }

    private globalRoles(): Role[] {
        return this.fetchedGuild.roles
            // Do not include managed roles, they are controlled by other bots
            .filter(r => !r.managed)
            .map(r => {
                // Disable all perms by default
                const permissions = { ...AllDisabledPerms }

                for (const truePerm of bitfieldToString(Number(r.permissions))) {
                    // .. enable the ones specified
                    permissions[truePerm.toLowerCase()] = true
                }

                return {
                    type: 'role' as const,
                    comment: r.name,
                    id: r.id,
                    permissions
                }
            })
    }

    async pull(guildId: string): Promise<GuildConfiguration> {
        const guild: APIGuild = await this.rest.get(Routes.guild(guildId)) as APIGuild
        const channels: APIChannel[] = await this.rest.get(Routes.guildChannels(guildId)) as APIChannel[]

        this.fetchedGuild = guild
        this.fetchedChannels = channels

        this.setMappings()

        return {
            id: guild.id,
            globalChannels: this.globalChannels(),
            globalRoles: this.globalRoles(),
            // It is reduced to a mapping for simplicity, but we need it flattened here
            categories: Object.values(this.categoryMapping())
        }
    }

    async push(configuration: GuildConfiguration): Promise<void> {
        // Push global role updates
        for (const role of configuration.globalRoles) {
            let permissions = 0n

            for (const [perm, enabled] of Object.entries(role.permissions)) {
                // Do not set the bit if the perm is not true (Discord requires us to publish the whole perm, not just a diff)
                if (enabled) {
                    const bits = BigInt(stringToBitField(perm.toUpperCase()))
                    permissions = permissions | bits
                }
            }

            await this.rest.patch(Routes.guildRole(configuration.id, role.id), {
                body: {
                    permissions: permissions.toString()
                }
            })
        }

        // Push global channel updates
        for (const channel of configuration.globalChannels) {
            const type = channel.channel_type
            let body: Record<string, unknown> = {}

            if (type === 'voice') {
                body = {
                    name: channel.comment,
                    nsfw: channel.options.nsfw,
                    bitrate: channel.options.bitrate,
                    user_limit: channel.options.userLimit
                }
            }
            else if (type === 'text') {
                body = {
                    name: channel.comment,
                    nsfw: channel.options.nsfw,
                    topic: channel.options.topic,
                    slowmode: channel.options.slowmode
                }
            }

            body.permission_overwrites = channel.overrides.map(r => {
                let allow = 0n
                let deny = 0n

                for (const [perm, enabled] of Object.entries(r.permissions)) {
                    if (enabled) {
                        allow = allow | BigInt(stringToBitField(perm))
                    }
                    else {
                        deny = deny | BigInt(stringToBitField(perm))
                    }
                }

                return {
                    id: r.id,
                    type: 0, // Always role overrides,
                    allow,
                    deny
                }
            })

            await this.rest.patch(Routes.channel(channel.id), {
                body
            })
        }


        // Push category updates
        for (const category of configuration.categories) {
            for (const channel of category.channels) {
                const type = channel.channel_type
                let body: Record<string, unknown> = {}

                if (type === 'voice') {
                    body = {
                        name: channel.comment,
                        nsfw: channel.options.nsfw,
                        bitrate: channel.options.bitrate,
                        user_limit: channel.options.userLimit
                    }
                }
                else if (type === 'text') {
                    body = {
                        name: channel.comment,
                        nsfw: channel.options.nsfw,
                        topic: channel.options.topic,
                        slowmode: channel.options.slowmode
                    }
                }

                body.permission_overwrites = channel.overrides.map(r => {
                    let allow = 0n
                    let deny = 0n

                    for (const [perm, enabled] of Object.entries(r.permissions)) {
                        if (enabled) {
                            allow = allow | BigInt(stringToBitField(perm.toUpperCase()))
                        }
                        else {
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

            // Update the category itself
            let body = {
                name: category.comment,
                permission_overwrites: category.overrides.map(r => {
                    let allow = 0n
                    let deny = 0n

                    for (const [perm, enabled] of Object.entries(r.permissions)) {
                        if (enabled) {
                            allow = allow | BigInt(stringToBitField(perm.toUpperCase()))
                        }
                        else {
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
    }
}
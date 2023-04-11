export type OptionValue = string | number | boolean

export type EntityType = 'role' | 'channel' | 'category'

export type Role = {
    id: string,
    comment: string,
    type: 'role',
    permissions: Record<string, boolean | undefined>
}

export type RoleOverride = {
    id: string,
    comment: string,
    type: 'role',
    permissions: Record<string, boolean | undefined>
}


export type VoiceChannel = {
    id: string,
    comment: string,
    type: 'channel',
    channel_type: 'voice'
    options: {
        nsfw: boolean,
        bitrate: number | undefined,
        userLimit: number | undefined
    }
    overrides: RoleOverride[]
}
export type TextChannel = {
    id: string,
    comment: string,
    type: 'channel',
    channel_type: 'text'
    options: {
        nsfw: boolean,
        slowmode: number,
        topic: string | undefined,
    }
    overrides: RoleOverride[]
}

export type Channel = TextChannel | VoiceChannel

export type Category = {
    id: string,
    comment: string,
    type: 'category',
    channels: Channel[],
    overrides: RoleOverride[]
}

export type Entity = Role | Channel | Category

export type GuildConfiguration = {
    id: string
    globalRoles: Role[],
    globalChannels: Channel[],
    categories: Category[]
}

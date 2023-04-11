import { AllDisabledPerms } from "../backend/permissions.js";
import { LuaFactory } from "wasmoon";
import { Category, Channel, GuildConfiguration, Role, RoleOverride, TextChannel, VoiceChannel } from "./data.js";

const factory = new LuaFactory()
const engine = await factory.createEngine()

type Table = Record<string, string | boolean | number | undefined>

function textOpts(table: Table): TextChannel['options'] {
    const out: TextChannel['options'] = {} as TextChannel['options']

    if (table.nsfw !== undefined) {
        out.nsfw = table.nsfw as boolean
    }
    
    if (table.slowmode !== undefined) {
        out.slowmode = table.slowmode as number
    }

    if (table.topic !== undefined) {
        out.topic = table.topic as string | undefined
    }

    return out
}

function voiceOpts(table: Table): VoiceChannel['options'] {
    const out: VoiceChannel['options'] = {} as VoiceChannel['options']

    if (table.nsfw !== undefined) {
        out.nsfw = table.nsfw as boolean
    }

    if (table.bitrate !== undefined) {
        out.bitrate = table.bitrate as number | undefined
    }

    if (table.user_limit !== undefined) {
        out.userLimit = table.user_limit as number | undefined
    }

    return out
}

const NON_PERMISSION_KEYS = [
    'id',
    'comment',
    'position',
    'channel_type'
]

function getRoleOverridesFromTable(table: Table, defaults: Record<string, boolean | undefined> = AllDisabledPerms): Record<string, boolean | undefined> {
    const out: Record<string, boolean | undefined> = { ...defaults }

    for (const [key, value] of Object.entries(table)) {
        if (NON_PERMISSION_KEYS.includes(key)) {
            continue
        }

        if (typeof value !== 'undefined' && typeof value !== 'boolean') {
            console.warn('Illegal value', value)
            continue
        }

        // .. enable the perms specified
        out[key] = value

    }
    return out
}

class GuildSetup {
    public readonly globalChannels: Channel[] = []
    public readonly globalRoles: Role[] = []
    public readonly categories: Category[] = []

    constructor(public readonly id: string) { }

    // Orphan setup
    global_channel = {
        text: (tbl: any) => {
            this.globalChannels.push({
                type: 'channel',
                channel_type: 'text',
                id: tbl.id,
                comment: tbl.comment,
                overrides: tbl.overrides ?? [],
                options: textOpts(tbl)
            })
        }, voice: (tbl: any) => {
            this.globalChannels.push({
                type: 'channel',
                channel_type: 'voice',
                id: tbl.id,
                comment: tbl.comment,
                overrides: tbl.overrides ?? [],
                options: voiceOpts(tbl)
            })
        },
    }

    global_role(tbl: any) {
        this.globalRoles.push({
            type: 'role',
            id: tbl.id,
            comment: tbl.comment,
            permissions: getRoleOverridesFromTable(tbl)
        })
    }

    // Category setup
    channel = {
        text: (tbl: any): Channel => ({
            type: 'channel',
            channel_type: 'text',
            id: tbl.id,
            comment: tbl.comment,
            overrides: tbl.overrides ?? [],
            options: textOpts(tbl)
        }),
        voice: (tbl: any): Channel => ({
            type: 'channel',
            channel_type: 'voice',
            id: tbl.id,
            comment: tbl.comment,
            overrides: tbl.overrides ?? [],
            options: voiceOpts(tbl)
        }),
    }

    role(tbl: any): RoleOverride {
        return {
            type: 'role',
            id: tbl.id,
            comment: tbl.comment,
            // {} to signify no defaults, `undefined` implies inherit.
            permissions: getRoleOverridesFromTable(tbl, {})
        }
    }

    category(tbl: any) {
        this.categories.push({
            type: 'category',
            id: tbl.id,
            comment: tbl.comment,
            // Coerce empty table (given to us as an object) into an empty array
            channels: Object.keys(tbl.channels ?? {}).length > 0 ? tbl.channels : [],
            overrides: Object.keys(tbl.overrides ?? {}).length > 0 ? tbl.overrides : []
        })
    }
}

export class GuildBuilder {
    constructor(private readonly config: string) { }

    async readConfiguration(): Promise<GuildConfiguration> {
        const result = await engine.doString(this.config)
        const setup = new GuildSetup(result.id)

        // Call the provided setup function
        result.setup(setup)

        return {
            id: setup.id,
            globalChannels: setup.globalChannels.sort((a, b) => a.id.localeCompare(b.id)),
            globalRoles: setup.globalRoles.sort((a, b) => a.id.localeCompare(b.id)),
            categories: setup.categories
        }
    }
}

import { LuaFactory } from "wasmoon";
import { Category, GuildChannel, GuildConfiguration, RoleOverride, Role, TextChannel, VoiceChannel, VoiceChannelWithOpts, TextChannelWithOpts } from "../util/schema.js";
import { validated } from "../util/lua.js";
import { z } from "zod";
import assert from "assert";
import { luaLib } from "../lua-lib/index.js";

const factory = new LuaFactory()
const engine = await factory.createEngine()


class GuildSetup {
    public readonly globalChannels: GuildChannel[] = []
    public readonly globalRoles: Role[] = []
    public readonly categories: Category[] = []

    constructor(public readonly id: string) { }

    // Orphan setup
    global_channel = {
        text: validated((tbl) => {
            this.globalChannels.push(tbl)
        }, TextChannelWithOpts),
        voice: validated((tbl) => {
            this.globalChannels.push(tbl)
        }, VoiceChannelWithOpts),
    }

    global_role = validated(tbl => this.globalRoles.push(tbl), Role)

    // Category setup
    channel = {
        text: (tbl: unknown) => ({ type: 'text', ...(z.object({})).passthrough().parse(tbl) }),
        voice: (tbl: unknown) => ({ type: 'voice', ...(z.object({})).passthrough().parse(tbl) }),
    }

    role = (tbl: unknown) => tbl

    category = validated(tbl => this.categories.push(tbl), Category)
}

export class GuildBuilder {
    static LIB_NAME = 'lib'

    constructor(private readonly config: string) { }

    async readConfiguration(): Promise<GuildConfiguration> {
        const _require = engine.global.get('require')
        engine.global.set('require', (maybeLibName: unknown) => {
            assert(typeof maybeLibName === 'string')
            if (maybeLibName === GuildBuilder.LIB_NAME) {
                return luaLib
            }
            else {
                return _require(maybeLibName)
            }
        })
        
        const result = await engine.doString(this.config)
        const setup = new GuildSetup(result.id)

        // Call the provided setup function
        result.setup(setup)

        return {
            guildId: setup.id,
            globalChannels: setup.globalChannels.sort((a, b) => a.id.localeCompare(b.id)),
            globalRoles: setup.globalRoles.sort((a, b) => a.id.localeCompare(b.id)),
            categories: setup.categories
        }
    }
}

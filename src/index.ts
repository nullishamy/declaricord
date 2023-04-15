import { Client } from "./backend/client.js"
import { GuildBuilder } from "./frontend/api.js"
import fs from 'fs/promises'
import { Config } from "./util/config.js"
import { Args } from "./frontend/cli/interface.js"
import { GuildConfiguration } from "./util/schema.js"
import { parseArgs } from "./frontend/cli/index.js"

export interface App {
    client: Client,
    config: Config,
    localConfig: GuildConfiguration,
    remoteConfig: GuildConfiguration
}

const makeConfig = async (args: Args) => {
    let config: Config

    // User passed a config path
    if (args.config) {
        config = Config.parse(JSON.parse(await fs.readFile(args.config, 'utf-8')))
    }
    // If not, assemble a config from args
    else {
        config = Config.parse({
            token: args.token,
            discordConfig: args.discordConfig,
            silent: args.silent
        })
    }

    // Apply overrides
    if (args.token) {
        config.token = args.token
    }

    if (args.discordConfig) {
        config.discordConfig = args.discordConfig
    }


    if (args.verbosity) {
        config.verbosity = args.verbosity
    }

    return config
}

export const wrapCommand = (cb: (args: Args, app: App) => void | Promise<void>) => {
    return async (args: Args) => {
        const config = await makeConfig(args)

        const builder = new GuildBuilder(await fs.readFile(config.discordConfig, 'utf-8'))
        const localConfig = await builder.readConfiguration()

        const client = new Client(localConfig.guildId, config.token)
        const remoteConfig = await client.pull(localConfig.guildId)

        return cb(args, {
            client,
            config,
            localConfig,
            remoteConfig
        })
    }
}

await parseArgs()

import { App } from "../../../index.js";
import { Args } from "../interface.js";

export default {
    command: ['pull'],
    aliases: [],
    describe: 'pull the config from discord',
    builder: undefined,
    handler: (_args: Args, app: App) => {
        console.log('--- DISCORD ---');
        console.log(JSON.stringify(app.remoteConfig, undefined, 2));
        console.log('--- DISCORD ---');
    }
} as const
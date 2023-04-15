import { App } from "../../../index.js";
import { Args } from "../interface.js";

export default {
    command: ['push'],
    aliases: [],
    describe: 'push the config to discord',
    builder: undefined,
    handler: async (_args: Args, app: App) => {
        if (app.config.verbosity >= 1) {
            console.log('--- CONFIG ---');
            console.log(JSON.stringify(app.localConfig, undefined, 2));
            console.log('--- CONFIG ---');
        }

        console.log('... Pushing ...');
        await app.client.push(app.localConfig)
        console.log('Done!');

    }
} as const
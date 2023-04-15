import { Args } from "../interface.js";
import { diffConfigurations, stringifyDiff } from "../../../backend/diff.js";
import { App } from "../../../index.js";

export default {
    command: ['dump'],
    aliases: [],
    describe: 'dump the local config as JSON',
    builder: undefined,
    handler: (_args: Args, app: App) => {
        console.log(JSON.stringify(app.localConfig, undefined, 2));
    }
} as const
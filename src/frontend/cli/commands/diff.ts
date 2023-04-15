import { Args } from "../interface.js";
import { diffConfigurations, stringifyDiff } from "../../../backend/diff.js";
import { App } from "src/index.js";

export default {
    command: ['diff'],
    aliases: [],
    describe: 'diff the local and remote configs',
    builder: undefined,
    handler: (_args: Args, app: App) => {
        console.log('--- DIFF ---');
        console.log(stringifyDiff(diffConfigurations(app.localConfig, app.remoteConfig) ?? []) || 'NO CHANGE')
        console.log('--- DIFF ---');
    }
} as const
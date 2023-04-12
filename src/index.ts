import { Client } from "./backend/client.js"
import { diffConfigurations, stringifyDiff } from "./backend/diff.js"
import { GuildBuilder as ConfigBuilder } from "./frontend/api.js"

const builder = new ConfigBuilder((await import('fs')).readFileSync('./samples/test.lua', 'utf-8'))
const configuration = await builder.readConfiguration()

const config = await builder.readConfiguration()
// console.log('--- CONFIG ---');
// console.log(JSON.stringify(config, undefined, 2));
// console.log('--- CONFIG ---');

const client = new Client(config.guildId, (await import('fs')).readFileSync('token.secret', 'utf-8'))
const current = await client.pull(config.guildId)
// console.log('--- DISCORD ---');
// console.log(JSON.stringify(current, undefined, 2));
// console.log('--- DISCORD ---');


console.log('--- DIFF ---');
console.log(stringifyDiff(diffConfigurations(config, current) ?? []) || 'NO CHANGE')
console.log('--- DIFF ---');

// await client.push(config)

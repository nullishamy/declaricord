import { GuildBuilder } from '../src/frontend/api'
import fs from 'fs/promises'
import { GuildConfiguration } from '../src/util/schema.js'

async function loadTestFile(path: string): Promise<GuildBuilder> {
    return new GuildBuilder(await fs.readFile(`./samples/${path}.lua`, 'utf-8'))
}

async function loadTestResult(path: string) {
    return JSON.parse(await fs.readFile(`./test/${path}.lua.json`, 'utf-8'))
}

async function assertSameConfig(config: GuildConfiguration, resultPath: string) {
    const resultJson = await loadTestResult(resultPath)
    expect(config).toMatchObject(resultJson)
}

describe('Integrations', () => {
    it("runs test.lua", async () => {
        const builder = await loadTestFile('test')
        const config = await builder.readConfiguration()
        await assertSameConfig(config, 'test')
    })
})

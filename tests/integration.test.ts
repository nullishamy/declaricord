import { GuildBuilder } from '../src/frontend/api'
import fs from 'fs/promises'
import { GuildConfiguration } from '../src/util/schema.js'

async function loadTestFile(path: string): Promise<GuildBuilder> {
    return new GuildBuilder(await fs.readFile(`./samples/${path}.lua`, 'utf-8'))
}

async function loadTestResult(path: string) {
    return JSON.parse(await fs.readFile(`./tests/results/${path}.lua.json`, 'utf-8'))
}

async function runTest(path: string) {
    const builder = await loadTestFile(path)
    const config = await builder.evaluateConfiguration()
    expect(config).toMatchSnapshot()
}

describe('Integrations', () => {
    it("runs minimal.lua", () => {
        return runTest('minimal')
    })

    it("runs roles.lua", () => {
        return runTest('roles')
    })

    it("runs channels.lua", () => {
        return runTest('channels')
    })

    it("runs channels-with-overrides.lua", () => {
        return runTest('channels-with-overrides')
    })
})

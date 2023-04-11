const { pathsToModuleNameMapper } = require('ts-jest')
const tsconfig = require('tsconfig')
const { config } = tsconfig.loadSync('.')
const { compilerOptions } = config

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
}

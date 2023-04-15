import { wrapCommand } from '../../index.js'
import yargs from 'yargs'
import diff from './commands/diff.js'
import lint from './commands/lint.js'
import pull from './commands/pull.js'
import push from './commands/push.js'
import { Args } from './interface.js'
import dump from './commands/dump.js'

let parsed: Args | undefined

export const parseArgs = async () => {
  if (parsed) return parsed

  const defaultBuilder = () => {
    return
  }

  const result = await yargs(process.argv.slice(2))
    .scriptName('dcd')
    .option('config', {
      type: 'string',
      alias: 'c',
      description: 'the config file to use'
    })
    .option('token', {
      type: 'string',
      alias: 't',
      description: 'the token to use, takes priority over the config file'
    })
    .option('discord-config', {
      type: 'string',
      alias: 'd',
      description: 'the discord config to use'
    })
    .option('verbosity', {
      type: 'count',
      alias: 'v',
      description: 'controls the amount of log messages the app produces',
      default: 0
    })
    .command(
      lint.command,
      lint.describe,
      defaultBuilder,
      wrapCommand(lint.handler)
    )
    .command(
      pull.command,
      pull.describe,
      defaultBuilder,
      wrapCommand(pull.handler)
    )
    .command(
      push.command,
      push.describe,
      defaultBuilder,
      wrapCommand(push.handler)
    )
    .command(
      diff.command,
      diff.describe,
      defaultBuilder,
      wrapCommand(diff.handler)
    )
    .command(
      dump.command,
      dump.describe,
      defaultBuilder,
      wrapCommand(dump.handler)
    )
    .help()
    .demandCommand()
    .wrap(null)
    .parse()

  parsed = result
  return result
}

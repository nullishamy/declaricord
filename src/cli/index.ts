import yargs from "yargs";
import diff from "./commands/diff.js";
import lint from "./commands/lint.js";
import pull from "./commands/pull.js";
import push from "./commands/push.js";
import { Args } from "./interface.js";
import exportCommand from "./commands/export.js";
import { wrapCommand } from "../index.js";

let parsed: Args | undefined;

export const parseArgs = async () => {
  if (parsed) return parsed;

  const defaultBuilder = () => {
    return;
  };

  const result = await yargs(process.argv.slice(2))
    .scriptName("dcd")
    .option("config", {
      type: "string",
      alias: "c",
      description: "the config file to use",
    })
    .option("token", {
      type: "string",
      alias: "t",
      description: "the token to use, takes priority over the config file",
    })
    .option("input", {
      type: "string",
      description: "the config path to use",
    })
    .option("frontend", {
      type: "string",
      default: "lua",
      describe: "the frontend to parse the input with",
    })
    .option("backend", {
      type: "string",
      default: "discord",
      describe: "the backend to push the config to",
    })
    .option("verbosity", {
      type: "count",
      alias: "v",
      description: "controls the amount of log messages the app produces",
      default: 0,
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
      exportCommand.command,
      exportCommand.describe,
      defaultBuilder,
      wrapCommand(exportCommand.handler)
    )
    .help()
    .demandCommand(
      1,
      `need a command! specify 'lint', 'pull', 'push', 'diff' or 'dump'`
    )
    .wrap(null)
    .parse();

  parsed = result;
  return result;
};

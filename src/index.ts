#!/usr/bin/env node

import { Client } from "./backend/client.js";
import { GuildBuilder } from "./frontend/api.js";
import fs from "fs/promises";
import { Config } from "./util/config.js";
import { Args } from "./frontend/cli/interface.js";
import { GuildConfiguration } from "./util/schema.js";
import { parseArgs } from "./frontend/cli/index.js";
import { initLogging } from "./util/logger.js";
import { DiscordAPIError } from "@discordjs/rest";

export interface App {
  client: Client;
  config: Config;
  localConfig: GuildConfiguration;
}

const makeConfig = async (args: Args) => {
  let config: Config;

  if (args.config) {
    // User passed a config path
    config = Config.parse(JSON.parse(await fs.readFile(args.config, "utf8")));
  } else {
    // If not, assemble a config from args
    config = Config.parse({
      token: args.token,
      discordConfig: args.discordConfig,
      silent: args.silent,
    });
  }

  // Apply overrides
  if (args.token) {
    config.token = args.token;
  }

  if (args.discordConfig) {
    config.discordConfig = args.discordConfig;
  }

  if (args.verbosity) {
    config.verbosity = args.verbosity;
  }

  return config;
};

export const wrapCommand = (
  cb: (args: Args, app: App) => void | Promise<void>
) => {
  return async (args: Args) => {
    try {
      const config = await makeConfig(args);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!global.logger) {
        global.logger = initLogging(config);
      }

      const builder = new GuildBuilder(config.discordConfig);
      const localConfig = await builder.evaluateConfiguration();

      const client = new Client(localConfig.guildId, config.token);
      await client.awaitReady();
      return await cb(args, {
        client,
        config,
        localConfig,
      });
    } catch (err) {
      if (err instanceof DiscordAPIError) {
        logger.error(
          `API failure on ${err.method} :: ${err.url}:\n\n${err.stack}`
        );
      } else {
        logger.error(`Unexpected error:\n${err}`);
      }
      process.exit(1);
    }
  };
};

// This will parse the selected command and run it, starting the app
await parseArgs();

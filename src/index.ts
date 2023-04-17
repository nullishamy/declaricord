#!/usr/bin/env node

import { Client } from "./backend/client.js";
import { GuildBuilder } from "./frontend/api.js";
import fs from "fs/promises";
import { Config } from "./util/config.js";
import { Args } from "./frontend/cli/interface.js";
import { GuildConfiguration } from "./util/schema.js";
import { parseArgs } from "./frontend/cli/index.js";

export interface App {
  client: Client;
  config: Config;
  localConfig: GuildConfiguration;
}

const makeConfig = async (args: Args) => {
  let config: Config;

  if (args.config) {
    // User passed a config path
    config = Config.parse(JSON.parse(await fs.readFile(args.config, "utf-8")));
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
    const config = await makeConfig(args);

    const builder = new GuildBuilder(
      await fs.readFile(config.discordConfig, "utf-8")
    );
    const localConfig = await builder.evaluateConfiguration();

    const client = new Client(localConfig.guildId, config.token);

    return await cb(args, {
      client,
      config,
      localConfig,
    });
  };
};

// This will parse the selected command and run it, starting the app
await parseArgs();

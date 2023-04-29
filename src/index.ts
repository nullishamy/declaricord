#!/usr/bin/env node

import fs from "fs/promises";
import { Config } from "./util/config.js";
import { Args } from "./cli/interface.js";
import { parseArgs } from "./cli/index.js";
import { initLogging } from "./util/logger.js";
import { DiscordAPIError } from "@discordjs/rest";
import { DiscordAPI } from "./backend/implementations/discord.js";
import { LuaFrontend } from "./frontend/implementations/lua.js";
import { Frontend } from "./frontend/abstraction.js";
import { Backend } from "./backend/abstraction.js";
import { Client } from "./backend/client.js";
import { JsonFrontend } from "./frontend/implementations/json.js";
import { JsonBackend } from "./backend/implementations/json.js";
import { PrettyJsonBackend } from "./backend/implementations/json-pretty.js";

export class App {
  constructor(
    public readonly frontend: Frontend,
    public readonly backend: Backend,
    public readonly config: Config
  ) {}

  get client() {
    return new Client(this.backend);
  }

  async loadLocalConfig(force = false) {
    // The frontend will handle caching for us
    const localConfigResult = await this.frontend.parseFromFile(
      this.config.inputPath,
      force
    );

    if (!localConfigResult.success) {
      throw localConfigResult.err;
    }

    return localConfigResult.data;
  }
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
      inputPath: args.input,
      silent: args.silent,
    });
  }

  // Apply overrides
  if (args.token) {
    config.token = args.token;
  }

  if (args.input) {
    config.inputPath = args.input;
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
    let config;
    let configErr;

    try {
      config = await makeConfig(args);
    } catch (err) {
      configErr = err;
    }

    if (!config) {
      logger.error(`Failed to parse config options:\n${configErr}`);
      return;
    }

    global.logger = initLogging(config);

    try {
      let frontend;
      let backend;

      switch (args.frontend) {
        case "lua":
          frontend = new LuaFrontend();
          break;
        case "json":
          frontend = new JsonFrontend();
          break;
        default:
          logger.fatal(`Unknown frontend ${args.frontend}`);
          return;
      }

      const localConfigResult = await frontend.parseFromFile(
        config.inputPath,
        false
      );

      if (!localConfigResult.success) {
        logger.error(
          `Failed to evaluate local config:${localConfigResult.err}`
        );
        process.exit(1);
      }

      const { guildId } = localConfigResult.data;

      // Would normally use an object / map, but switching is easier due to construction inconvenience
      switch (args.backend) {
        case "discord":
          backend = new DiscordAPI({
            id: guildId,
            token: config.token,
          });
          break;
        case "json":
          backend = new JsonBackend(guildId);
          break;
        case "json-pretty":
          backend = new PrettyJsonBackend(guildId);
          break;
        default:
          logger.fatal(`Unknown backend ${args.backend}`);
          return;
      }

      return await cb(args, new App(frontend, backend, config));
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

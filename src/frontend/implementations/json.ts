import { GuildConfiguration } from "../../util/schema.js";
import { Frontend, ParseResult } from "../abstraction.js";
import fs from "fs/promises";

export class JsonFrontend extends Frontend {
  parseFromData(data: string, force: boolean): Promise<ParseResult> {
    if (this.loadedConfig && !force) {
      return Promise.resolve({
        success: true,
        data: this.loadedConfig,
      });
    }

    const jsonResult: unknown = JSON.parse(data);
    const config = GuildConfiguration.parse(jsonResult);

    this.loadedConfig = config;

    return Promise.resolve({
      success: true,
      data: config,
    });
  }

  async parseFromFile(path: string, force: boolean): Promise<ParseResult> {
    return this.parseFromData(await fs.readFile(path, "utf-8"), force);
  }
}

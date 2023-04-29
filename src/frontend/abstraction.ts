import assert from "assert";
import { GuildConfiguration } from "../util/schema.js";

interface ParseResultOk {
  success: true;
  data: GuildConfiguration;
}

interface ParseResultErr {
  success: false;
  err: Error;
}

export type ParseResult = ParseResultOk | ParseResultErr;

export abstract class Frontend {
  protected loadedConfig: GuildConfiguration | undefined;

  constructor(loadedConfig?: GuildConfiguration) {
    this.loadedConfig = loadedConfig;
  }

  assertLoadedConfig() {
    assert(this.loadedConfig, "config not loaded");
    return this.loadedConfig;
  }

  abstract parseFromData(data: string, force: boolean): Promise<ParseResult>;
  abstract parseFromFile(path: string, force: boolean): Promise<ParseResult>;
}

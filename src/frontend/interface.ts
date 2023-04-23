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

export interface Frontend {
  name: string;

  parseFromData(data: string): Promise<ParseResult>;
  parseFromFile(path: string): Promise<ParseResult>;
}

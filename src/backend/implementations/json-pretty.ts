import {
  Category,
  GuildChannelWithOpts,
  GuildConfiguration,
  Role,
} from "../../util/schema.js";
import { JsonBackend } from "./json.js";

export class PrettyJsonBackend extends JsonBackend {
  exportConfig(config: GuildConfiguration) {
    return JSON.stringify(config, undefined, 2);
  }
}

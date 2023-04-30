import { CONFIG_MAJOR, CONFIG_MINOR } from "./constants.js";

export function isVersionCompatible(configVersion: string) {
  // Our schema is pre-defined, so we do not need a parser lib
  const [major, minor] = configVersion.substring(1).split(".").map(Number);

  // Major mismatch, possible breaking changes
  if (CONFIG_MAJOR !== major) {
    return false;
  }

  // Declared version is newer than our version
  if (CONFIG_MINOR < minor) {
    return false;
  }

  // Otherwise, the version is valid
  return true;
}

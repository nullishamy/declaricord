import { ZodError } from "zod";
import { prettyZodError } from "../util/error.js";

type ConfigVisitorScope = "roles" | "channels";
interface ConfigVisitor {
  scope: ConfigVisitorScope;
  callback: (...args: unknown[]) => unknown;
}

const LibState = {
  // `object` because we need to preserve the input format 1-1
  storedRoles: new Map<string, object>(),
  visitors: new Map<ConfigVisitorScope, ConfigVisitor>(),
};

// Primarily used for testing
export const resetLib = () => {
  LibState.storedRoles = new Map();
  LibState.visitors = new Map();
};

export const wrapLib = (
  fn: (state: typeof LibState, args: unknown[]) => unknown
) => {
  return (...args: unknown[]) => {
    try {
      return fn(LibState, args);
    } catch (err) {
      if (err instanceof ZodError) {
        logger.error(prettyZodError(err));
      } else {
        logger.error(`Unexpected error:\n${err}`);
      }

      throw err;
    }
  };
};

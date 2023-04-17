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
    return fn(LibState, args);
  };
};

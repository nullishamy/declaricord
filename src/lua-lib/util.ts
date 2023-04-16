const LibState = {
  // `object` because we need to preserve the input format 1-1
  storedRoles: new Map<string, object>()
}

export const wrapLib = (fn: (state: typeof LibState, args: unknown[]) => unknown | Promise<unknown>) => {
  return (...args: unknown[]) => {
    return fn(LibState, args)
  }
}
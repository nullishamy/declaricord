import { SafeParseReturnType } from "zod";
import { prettyZodError } from "./error.js";

interface AnySchema<T> {
  safeParse: (data: unknown) => SafeParseReturnType<unknown, T>;
}

export function validated<T>(
  callback: (obj: T) => unknown,
  schema: AnySchema<T>
) {
  return (luaTbl: unknown) => {
    const res = schema.safeParse(luaTbl);

    if (res.success) {
      return callback(res.data);
    } else {
      const err = res.error;
      logger.error(prettyZodError(err));
    }
  };
}

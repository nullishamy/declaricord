import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export function prettyZodError(err: ZodError) {
  const stack = new Error().stack;
  const zodErr = fromZodError(err, {
    prefix: "Schema error",
    prefixSeparator: ":\n ",
    issueSeparator: "\n -",
    unionSeparator: "\n\t (in union) and ",
  }).toString();
  return `${zodErr}\n\nStack:\n${stack}`;
}

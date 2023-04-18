import pino from "pino";

declare global {
  // `var` is needed for the value to exist properly in the types
  // eslint-disable-next-line no-var
  var logger: pino.Logger;
}

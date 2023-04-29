import { pino } from "pino";
import { Config } from "./config.js";

const defaultLoggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
};

export function initLogging(config: Config | undefined): pino.Logger {
  const loggerOptions = { ...defaultLoggerOptions };

  if (process.env.NODE_ENV !== "production") {
    loggerOptions.transport = {
      target: "pino-pretty",
    };
  }

  if ((config?.verbosity ?? 0) >= 1) {
    loggerOptions.level = "debug";
  }

  return pino(loggerOptions);
}

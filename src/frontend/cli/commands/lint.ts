import { lintConfig } from "../../../backend/lint.js";
import { App } from "../../../index.js";
import { Args } from "../interface.js";

export default {
  command: ["lint"],
  aliases: [],
  describe: "lint the local config",
  builder: undefined,
  handler: (_: Args, app: App) => {
    logger.info("--- LINT ---");
    const diagnostics = lintConfig(app.localConfig);

    const severityToLogLevel = {
      fatal: "error",
      warning: "warn",
      info: "info",
    } as const;

    for (const diagnostic of diagnostics) {
      const logFn =
        logger[severityToLogLevel[diagnostic.severity]].bind(logger);

      logFn(`${diagnostic.identifier} :: ${diagnostic.message}`);
    }

    if (!diagnostics.length) {
      logger.info("No diagnostics! :D");
    }

    logger.info("--- LINT ---");
  },
};

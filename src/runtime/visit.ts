import assert from "assert";
import { GuildSetup } from "../frontend/api.js";
import { wrapLib } from "./util.js";

export const visit = wrapLib(({ visitors }, [val, scope]) => {
  if (typeof val === "function") {
    // Setting a visitor
    assert(typeof scope === "string");

    // TODO: zod this
    assert(
      scope === "roles" || scope === "channels",
      "scope was not channels or roles"
    );

    if (visitors.has(scope)) {
      throw new Error(`scope ${scope} already set`);
    }

    visitors.set(scope, {
      scope,
      // SAFE: We type check as a `Function` above. TS does not allow for conversion between
      // Function and the functional types for some reason, so we must cast
      // We do not do type unsafe behavior here, the resulting type is still broad enough
      callback: val as (...args: unknown[]) => unknown,
    });

    return;
  } else if (typeof val === "object") {
    // Applying all visitors
    assert(
      val instanceof GuildSetup,
      "provided object was not GuildSetup (pass self instead)"
    );

    for (const [scope, visitor] of visitors.entries()) {
      switch (scope) {
        case "channels":
          for (const channel of val.globalChannels) {
            visitor.callback(channel);
          }
          break;
        case "roles":
          for (const role of val.globalRoles) {
            visitor.callback(role);
          }
          break;
        default:
          assert(false);
      }
    }
    return;
  }

  assert(false, `unknown type ${typeof val} (${JSON.stringify(val)})`);
});

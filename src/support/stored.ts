import { RoleOverride } from "../util/schema.js";
import { wrapLib } from "./util.js";

export const stored = wrapLib(({ storedRoles }, [key, val]) => {
  if (key === null || key === undefined || typeof key !== "string") {
    throw new Error("nil");
  }

  if (typeof val === "object") {
    // Storing a role
    if (val === null) {
      throw new Error("nil");
    }

    const role = RoleOverride.parse(val);
    if (storedRoles.has(key)) {
      throw new Error(`role ${role.id} already exists`);
    }

    storedRoles.set(key, {
      ...val,
      type: "role",
    });

    return role;
  } else {
    // Fetching a role
    const role = storedRoles.get(key);

    if (!role) {
      throw new Error(`non existent key ${key}`);
    }

    return role;
  }
});

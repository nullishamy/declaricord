import { RoleOverride } from '../util/schema.js'

// object because we need to preserve the input format 1-1
const storedRoles = new Map<string, object>()

export const luaLib = {
  stored: (val: unknown) => {
    if (val === null || val === undefined) {
      throw new Error('nil')
    }

    if (typeof val === 'object') {
      // Storing a role
      const role = RoleOverride.parse(val)
      if (storedRoles.has(role.id)) {
        throw new Error(`role ${role.id} already exists`)
      }

      storedRoles.set(role.id, val)

      return role
    } else if (typeof val === 'string') {
      // Fetching a role
      const role = storedRoles.get(val)

      if (!role) {
        throw new Error(`non existent role id ${val}`)
      }

      return role
    }

    throw new Error(`invalid type '${typeof val}' (${JSON.stringify(val)}`)
  }
}

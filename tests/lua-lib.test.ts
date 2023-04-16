import { stored } from "../src/runtime/stored.js";

describe("Lua library", () => {
  const DEFAULT_ROLE = {
    id: "42394823948909090",
    comment: "mods-2",
  };

  it("stores one role without error", () => {
    stored(DEFAULT_ROLE);
  });

  it("stores one role and fetches it", () => {
    expect(stored(DEFAULT_ROLE.id)).toStrictEqual(DEFAULT_ROLE)
  });

  it('tries to store undefined', () => {
    expect(() => stored(undefined)).toThrowError()
  })

  it('tries to store null', () => {
    expect(() => stored(null)).toThrowError()
  })

  it('tries to store a number', () => {
    expect(() => stored(1)).toThrowError()
  })

  it('tries to store a boolean', () => {
    expect(() => stored(true)).toThrowError()
  })

  it('tries to store an array', () => {
    expect(() => stored([])).toThrowError()
  })
});

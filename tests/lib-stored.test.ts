import { luaLib } from "../src/runtime/index.js";
import { resetLib } from "../src/runtime/util.js";

describe("Stored (Lib)", () => {
  const DEFAULT_ROLE = {
    id: "42394823948909090",
    comment: "mods-2",
    type: "role",
  };

  const DEFAULT_ROLE_KEY = "default role";

  beforeEach(() => resetLib());

  const stored = luaLib.stored;

  it("stores one role without error", () => {
    stored(DEFAULT_ROLE_KEY, DEFAULT_ROLE);
  });

  it("stores one role and fetches it", () => {
    stored(DEFAULT_ROLE_KEY, DEFAULT_ROLE);
    expect(stored(DEFAULT_ROLE_KEY)).toStrictEqual(DEFAULT_ROLE);
  });

  it("tries to store undefined", () => {
    expect(() => stored(undefined)).toThrowError();
  });

  it("tries to store null", () => {
    expect(() => stored(null)).toThrowError();
  });

  it("tries to store a number", () => {
    expect(() => stored(1)).toThrowError();
  });

  it("tries to store a boolean", () => {
    expect(() => stored(true)).toThrowError();
  });

  it("tries to store an array", () => {
    expect(() => stored([])).toThrowError();
  });

  it("tries to fetch a non existent role", () => {
    expect(() => stored("DOES NOT EXIST")).toThrowError();
  });

  it("fails to store the same role twice", () => {
    stored(DEFAULT_ROLE_KEY, DEFAULT_ROLE);
    expect(() => stored(DEFAULT_ROLE_KEY, DEFAULT_ROLE)).toThrowError();
  });

  it("passes an object without an id", () => {
    expect(() =>
      stored({
        comment: "",
      })
    ).toThrowError();
  });

  it("passes an object without a comment", () => {
    expect(() =>
      stored({
        id: "",
      })
    ).toThrowError();
  });

  it("keeps the permissions intact", () => {
    const role = {
      ...DEFAULT_ROLE,
      manage_messages: true,
    };

    stored(DEFAULT_ROLE_KEY, role);

    expect(stored(DEFAULT_ROLE_KEY)).toStrictEqual(role);
  });
});

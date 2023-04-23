import { luaLib } from "../src/support/index.js";
import { resetLib } from "../src/support/util.js";

describe("Table (Lib)", () => {
  beforeEach(() => resetLib());

  const table = luaLib.table;

  it("stringifies null", () => {
    expect(table.stringify(null)).toStrictEqual("null");
  });

  it("stringifies a string", () => {
    expect(table.stringify("a string")).toStrictEqual(`"a string"`);
  });

  it("stringifies an empty array", () => {
    expect(table.stringify([])).toStrictEqual(`[]`);
  });

  it("stringifies an empty object", () => {
    expect(table.stringify({})).toStrictEqual(`{}`);
  });

  it("stringifies a number", () => {
    expect(table.stringify(1)).toStrictEqual(`1`);
  });

  it("stringifies booleans", () => {
    expect(table.stringify(true)).toStrictEqual(`true`);
    expect(table.stringify(false)).toStrictEqual(`false`);
  });

  it("maps an empty array", () => {
    expect(table.map([], (val: unknown) => val)).toStrictEqual([]);
  });

  it("maps an array of numbers", () => {
    expect(table.map([1], (val: number) => val + 1)).toStrictEqual([2]);
  });
});

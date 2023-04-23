import { resetLib } from "../src/support/util.js";
import { luaFrontend } from "../src/frontend/implementations/lua.js";

async function runTest(path: string) {
  const config = await luaFrontend.parseFromFile(`./samples/${path}.lua`);

  expect(config).toMatchSnapshot();
}

describe("Integrations", () => {
  beforeEach(() => resetLib());

  it("runs minimal.lua", async () => {
    return await runTest("minimal");
  });

  it("runs lib-minimal.lua", async () => {
    return await runTest("lib-minimal");
  });

  it("runs roles.lua", async () => {
    return await runTest("roles");
  });

  it("runs channels.lua", async () => {
    return await runTest("channels");
  });

  it("runs channels-with-overrides.lua", async () => {
    return await runTest("channels-with-overrides");
  });

  it("runs categories.lua", async () => {
    return await runTest("categories");
  });

  it("runs lint-fails.lua", async () => {
    return await runTest("lint-fails");
  });

  it("runs inheritance-role.lua", async () => {
    return await runTest("inheritance-role");
  });

  it("runs inheritance-category.lua", async () => {
    return await runTest("inheritance-category");
  });

  // Lib
  it("runs lib-roles.lua", async () => {
    return await runTest("lib-roles");
  });
});

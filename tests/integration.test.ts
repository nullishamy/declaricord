import { resetLib } from "../src/support/util.js";
import { initLogging } from "../src/util/logger.js";
import { LuaFrontend } from "../src/frontend/implementations/lua.js";

async function runTest(path: string) {
  const config = await new LuaFrontend().parseFromFile(
    `./samples/${path}.lua`,
    true
  );

  if (!config.success) {
    throw config.err;
  }

  expect(config).toMatchSnapshot();
}

describe("Integrations", () => {
  beforeEach(() => {
    global.logger = initLogging(undefined);
    resetLib();
  });

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

  it("runs categories-with-overrides.lua", async () => {
    return await runTest("categories-with-overrides");
  });

  it("runs lint-fails.lua", async () => {
    return await runTest("lint-fails");
  });

  it("runs version-fails.lua", async () => {
    await expect(() => runTest("version-fails")).rejects.toMatchInlineSnapshot(
      `[Error: Declared config version v100.0.0 is not compatible with project version v1.0.0, please update]`
    );
  });

  it("runs inheritance-role.lua", async () => {
    return await runTest("inheritance-role");
  });

  it("runs inheritance-category.lua", async () => {
    return await runTest("inheritance-category");
  });

  it("runs forums.lua", async () => {
    return await runTest("forums");
  });

  it("runs forums-category.lua", async () => {
    return await runTest("forums-category");
  });

  // Lib
  it("runs lib-roles.lua", async () => {
    return await runTest("lib-roles");
  });
});

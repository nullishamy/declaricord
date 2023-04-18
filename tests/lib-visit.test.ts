import { luaLib } from "../src/runtime/index.js";
import { resetLib } from "../src/runtime/util.js";
import { jest } from "@jest/globals";
import { GuildSetup } from "../src/frontend/api.js";

describe("Visit (Lib)", () => {
  beforeEach(() => resetLib());

  const visit = luaLib.visit;
  const noopVisitor = jest.fn();

  it("sets a role visitor", () => {
    visit(noopVisitor, "roles");
  });

  it("sets a channel visitor", () => {
    visit(noopVisitor, "channels");
  });

  it("does not set a role visitor twice", () => {
    visit(noopVisitor, "roles");
    expect(() => visit(noopVisitor, "roles")).toThrowError();
  });

  it("does not set a channel visitor twice", () => {
    visit(noopVisitor, "channels");
    expect(() => visit(noopVisitor, "channels")).toThrowError();
  });

  it("does not set a visitor for an invalid scope", () => {
    expect(() => visit(noopVisitor, "INVALID SCOPE")).toThrowError();
  });

  it("does not allow string callbacks", () => {
    expect(() => visit("", "channels")).toThrowError();
  });

  it("does not allow number callbacks", () => {
    expect(() => visit(1, "channels")).toThrowError();
  });

  it("does not allow boolean callbacks", () => {
    expect(() => visit(true, "channels")).toThrowError();
  });

  // FIXME: Make these tests nicer looking vvv
  it("does not execute callback without roles", () => {
    const cb = jest.fn();
    const setup = new GuildSetup("12345678989898989");
    visit(cb, "roles");
    visit(setup);
    expect(cb).not.toBeCalled();
  });

  it("does not execute callback without channels", () => {
    const cb = jest.fn();
    const setup = new GuildSetup("12345678989898989");
    visit(cb, "channels");
    visit(setup);
    expect(cb).not.toBeCalled();
  });

  it("does executes callback with roles", () => {
    const setup = new GuildSetup("12345678989898989");
    setup.globalRoles.push({
      id: "12312312312123",
      comment: "none",
      permissions: {},
      options: {
        colour: 0,
        hoisted: false,
        mentionableByEveryone: false,
      },
    });

    const cb = jest.fn();
    visit(cb, "roles");
    visit(setup);
    expect(cb).toBeCalledTimes(1);
  });

  it("does executes callback with channels ", () => {
    const setup = new GuildSetup("12345678989898989");
    setup.globalChannels.push({
      id: "12312312312123",
      comment: "none",
      parentId: undefined,
      type: "text",
      predicate: () => true,
      options: {
        nsfw: false,
        slowmode: 0,
        topic: "",
      },
      overrides: [],
    });

    const cb = jest.fn();
    visit(cb, "channels");
    visit(setup);
    expect(cb).toBeCalledTimes(1);
  });
});

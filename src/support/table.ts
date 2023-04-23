import assert from "assert";
import { wrapLib } from "./util.js";

export const table = {
  map: wrapLib((_, [tbl, mapper]) => {
    assert(Array.isArray(tbl));
    assert(typeof mapper === "function");

    return (tbl as unknown[]).map((v) => mapper(v) as unknown);
  }),
  stringify: wrapLib((_, [val]) => {
    return JSON.stringify(val);
  }),
  stringify_pretty: wrapLib((_, [val]) => {
    return JSON.stringify(val, undefined, 2);
  }),
};

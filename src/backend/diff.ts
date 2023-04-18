import deepDiff, { Diff } from "deep-diff";
import { GuildConfiguration } from "../util/schema.js";

// Ignore predicates, we don't need to compare them
const DIFF_IGNORE_KEYS = ["predicate"];

export function diffConfigurations(
  localConfig: GuildConfiguration,
  discordConfig: GuildConfiguration
) {
  return deepDiff(
    localConfig,
    discordConfig,
    (_, key: string) => !DIFF_IGNORE_KEYS.indexOf(key)
  );
}

export function stringifyDiff(diff: Diff<GuildConfiguration>[]): string {
  // LHS: Config
  // RHS: Discord

  const pathStr = (item: object, path?: string[]) =>
    `'${JSON.stringify(item)}' @ '${path?.join(".") ?? "root"}'`;

  return diff
    .map((d) => {
      if (d.kind === "N") {
        return `Value ${pathStr(
          d.rhs,
          d.path
        )} exists on Discord but not locally.`;
      } else if (d.kind === "A") {
        return `Array element modified: index ${d.index} of ${
          d.path?.join(".") ?? "root"
        } -- ${stringifyDiff([d.item])}`;
      } else if (d.kind === "D") {
        return `Value ${pathStr(
          d.lhs,
          d.path
        )} missing from Discord but present in local config`;
      } else {
        return `Value divergence @ '${
          d.path?.join(".") ?? "root"
        }': Config: '${JSON.stringify(d.lhs)}' -- Discord: '${JSON.stringify(
          d.rhs
        )}'`;
      }
    })
    .join("\n");
}

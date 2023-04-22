import deepDiff, { Diff } from "deep-diff";
import { GuildConfiguration } from "../util/schema.js";
import { format as prettyFormat } from "pretty-format";
import { diff } from "jest-diff";
import chalk from "chalk";

// Ignore predicates, we don't need to compare them
const DIFF_IGNORE_KEYS = ["predicate"];

// We use two diff implementations here
// It is more expensive, however we get a really nice balance
// between readability, functionality, usability and aesthetics
export function diffConfigurations(
  localConfig: GuildConfiguration,
  remoteConfig: GuildConfiguration
) {
  const diffRes = deepDiff(
    localConfig,
    remoteConfig,
    (_, key: string) => !DIFF_IGNORE_KEYS.indexOf(key)
  );

  if (diffRes) {
    const diffOpts = {
      contextLines: 15,
      omitAnnotationLines: true,
      aIndicator: "L",

      aColor: chalk.green,
      bIndicator: "D",

      bColor: chalk.blueBright,
      expand: false,
    };

    const formatOpts = {
      printFunctionName: false,
    };

    return `\nChanges:\n${stringifyDiff(diffRes)}\n\nObject view:\n${diff(
      prettyFormat(localConfig, formatOpts),
      prettyFormat(remoteConfig, formatOpts),
      diffOpts
    )}`;
  }

  return "No changes";
}

function stringifyDiff(diff: Diff<GuildConfiguration>[]): string {
  // LHS: Config
  // RHS: Discord

  const pathStr = (item: object, path?: string[]) =>
    `'${JSON.stringify(item)}' @ '${path?.join(".") ?? "base"}'`;

  return diff
    .map((d) => {
      if (d.kind === "N") {
        return `Missing ${pathStr(d.rhs, d.path)}`;
      } else if (d.kind === "A") {
        return `Array change: index ${d.index} of ${
          d.path?.join(".") ?? "root"
        } -- ${stringifyDiff([d.item])}`;
      } else if (d.kind === "D") {
        return `Missing: ${pathStr(d.lhs, d.path)}`;
      } else {
        return `Value divergence @ '${d.path?.join(".") ?? "root"}'`;
      }
    })
    .join("\n");
}

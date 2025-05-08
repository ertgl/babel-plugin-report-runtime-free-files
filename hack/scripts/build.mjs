import { getArgumentValue } from "../lib/args.mjs";
import { buildBootstrapped } from "../lib/build.mjs";

/**
 * @import { type BuildTargetFormat } from "../lib/types.mjs";
 */

/**
 * @type {BuildTargetFormat}
 */
// @ts-expect-error - Cannot type-cast in JavaScript.
const format = (
  getArgumentValue(
    process.argv,
    "--format",
  )
  ?? "cjs"
);

buildBootstrapped(format);

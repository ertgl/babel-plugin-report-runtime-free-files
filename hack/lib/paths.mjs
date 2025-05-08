import {
  dirname,
  relative as getRelativePath,
  parse as parsePath,
  resolve as resolvePath,
} from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

export const HACK_DIRECTORY_PATH = dirname(__dirname);

export const ROOT_DIRECTORY_PATH = dirname(HACK_DIRECTORY_PATH);

export const BOOTSTRAP_DIRECTORY_PATH = resolvePath(ROOT_DIRECTORY_PATH, "bootstrap");

export const DIST_DIRECTORY_PATH = resolvePath(ROOT_DIRECTORY_PATH, "dist");

export const SRC_DIRECTORY_PATH = resolvePath(ROOT_DIRECTORY_PATH, "src");

/**
 * @import { type BuildTargetFormat } from "./types.mjs";
 */
import { BUILD_TARGET_FORMAT_TO_FILE_EXTENSION_MAP } from "./build.mjs";

/**
 * @param {string} sourceFilePath
 * @param {BuildTargetFormat} format
 * @returns {string}
 */
export function generateDistFilePath(
  sourceFilePath,
  format,
)
{
  const extension = BUILD_TARGET_FORMAT_TO_FILE_EXTENSION_MAP[format];
  const srcRelativePath = getRelativePath(SRC_DIRECTORY_PATH, sourceFilePath);
  const srcRelativePathInfo = parsePath(srcRelativePath);

  return resolvePath(
    DIST_DIRECTORY_PATH,
    format,
    srcRelativePathInfo.dir,
    srcRelativePathInfo.name + extension,
  );
}

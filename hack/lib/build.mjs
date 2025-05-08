import {
  globSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import {
  dirname,
  relative as getRelativePath,
  resolve as resolvePath,
} from "node:path";
import { fileURLToPath } from "node:url";

import { transformSync } from "@babel/core";

import {
  ROOT_DIRECTORY_PATH,
  SRC_DIRECTORY_PATH,
} from "./paths.mjs";
import { generateDistFilePath } from "./paths.mjs";
import { createRuntimeFreeFileReporterOptions } from "./runtime-free-files.mjs";

/**
 * @import { type Dirent } from "node:fs";
 *
 * @import {
 *   type BuildTargetFormat,
 *   type FileExtension,
 * } from "./types.mjs";
 */

const __filename = fileURLToPath(import.meta.url);

const require = createRequire(__filename);

/**
 * @type {Record<BuildTargetFormat, FileExtension>}
 */
export const BUILD_TARGET_FORMAT_TO_FILE_EXTENSION_MAP = {
  cjs: ".cjs",
  esm: ".mjs",
};

/**
 * @param {BuildTargetFormat} format
 */
export function buildBootstrapped(
  format,
)
{
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (BUILD_TARGET_FORMAT_TO_FILE_EXTENSION_MAP[format] == null)
  {
    throw new TypeError(
      `Invalid build target format: ${format}`,
    );
  }

  for (const sourceFileDirent of iterateSourceFileDirents())
  {
    const sourceFilePath = resolvePath(
      sourceFileDirent.parentPath,
      sourceFileDirent.name,
    );

    const outputFilePath = generateDistFilePath(
      sourceFilePath,
      format,
    );

    const sourceCode = readFileSync(
      sourceFilePath,
      "utf8",
    );

    const transpiledCode = transformSync(
      sourceCode,
      {
        configFile: resolvePath(
          ROOT_DIRECTORY_PATH,
          `babel.config.${format}.cjs`,
        ),
        cwd: ROOT_DIRECTORY_PATH,
        filename: sourceFilePath,
        plugins: [
          [
            // Available after the bootstrap phase.
            require.resolve("../../bootstrap/index.cjs"),
            createRuntimeFreeFileReporterOptions(),
          ],
        ],
      },
    );

    if (transpiledCode?.code == null)
    {
      continue;
    }

    /**
     * @type {boolean}
     */
    // @ts-expect-error - `isRuntimeFree` is not typed.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const isTranspiledCodeRuntimeFree = transpiledCode.metadata?.isRuntimeFree ?? false;

    if (isTranspiledCodeRuntimeFree)
    {
      continue;
    }

    let outputFileContent = transpiledCode.code;

    mkdirSync(
      dirname(outputFilePath),
      {
        recursive: true,
      },
    );

    if (transpiledCode.map != null)
    {
      const outputSourceMapFilePath = outputFilePath + ".map";

      const outputSourceMapRelativeFilePath = getRelativePath(
        dirname(outputFilePath),
        outputSourceMapFilePath,
      );

      outputFileContent += `\n//# sourceMappingURL=${outputSourceMapRelativeFilePath}`;

      writeFileSync(
        outputSourceMapFilePath,
        JSON.stringify(transpiledCode.map),
        "utf8",
      );
    }

    writeFileSync(
      outputFilePath,
      outputFileContent,
      "utf8",
    );
  }
}

/**
 * @yields {Dirent}
 * @returns {Iterable<Dirent>}
 */
export function* iterateSourceFileDirents()
{
  yield* globSync(
    "**/*.{cj,ct,j,mj,mt,t}s",
    {
      cwd: SRC_DIRECTORY_PATH,
      withFileTypes: true,
    },
  );
}

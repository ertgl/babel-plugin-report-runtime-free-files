import {
  notStrictEqual,
  strictEqual,
} from "node:assert";
import { createRequire } from "node:module";
import {
  dirname,
  extname,
} from "node:path";
import {
  mock,
  test,
} from "node:test";
import { fileURLToPath } from "node:url";

import { transformSync } from "@babel/core";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Available after build.
import runtimeFreeFileReporterPlugin from "babel-plugin-report-runtime-free-files";

/**
 * @import {
 *   type Mock,
 *   type TestContext,
 * } from "node:test";
 *
 * @import {
 *   type NodePath,
 *   type PluginPass,
 * } from "@babel/core";
 * @import { type Program } from "@babel/types";
 *
 * @import {
 *   type CallbackFunction as RuntimeFreeFileReporterCallbackFunction,
 *   type Options as RuntimeFreeFileReporterPluginOptions,
 * } from "../src/index.js";
 */

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const require = createRequire(__filename);

const TEST_DATASET = [
  {
    code: "// Comment.",
    isRuntimeFree: true,
    name: "comment",
  },
  {
    code: "interface A {}",
    isRuntimeFree: true,
    name: "interface",
  },
  {
    code: "export interface B {}",
    isRuntimeFree: true,
    name: "export interface",
  },
  {
    code: "type C = boolean;",
    isRuntimeFree: true,
    name: "type",
  },
  {
    code: "export type D = number;",
    isRuntimeFree: true,
    name: "export type",
  },
  {
    code: "const n1 = 1;",
    isRuntimeFree: false,
    name: "const",
  },
  {
    code: "export const n2 = 2;",
    isRuntimeFree: false,
    name: "export const",
  },
];

/**
 * @param {unknown[] | null | undefined} array
 * @returns {void}
 */
function cleanArray(
  array,
)
{
  if (array == null)
  {
    return;
  }

  while (array.length > 0)
  {
    array.pop();
  }
}

/**
 * @param {boolean} expectedIsRuntimeFree
 * @param {NodePath<Program>} programPath
 * @param {PluginPass} programState
 * @param {boolean} isRuntimeFree
 */
function cleanRuntimeFreeFile(
  expectedIsRuntimeFree,
  programPath,
  programState,
  isRuntimeFree,
)
{
  strictEqual(isRuntimeFree, expectedIsRuntimeFree);

  if (!isRuntimeFree)
  {
    return;
  }

  cleanArray(programPath.node.body);
  cleanArray(programPath.node.directives);

  cleanArray(programPath.node.trailingComments);
  cleanArray(programPath.node.innerComments);
  cleanArray(programPath.node.leadingComments);

  programPath.stop();
}

/**
 * @template T
 * @param {T[]} array
 * @param {number} numberOfElements
 * @param {function(T[]): Promise<void>} callback
 * @returns {Promise<void>}
 */
async function permutate(
  array,
  numberOfElements,
  callback,
)
{
  if (numberOfElements === 0)
  {
    await callback([]);
    return;
  }

  for (let i = 0; i < array.length; i++)
  {
    const currentElement = array[i];
    const remainingElements = array.slice(0, i).concat(array.slice(i + 1));

    await permutate(
      remainingElements,
      numberOfElements - 1,
      async (permutation) =>
      {
        await callback([currentElement].concat(permutation));
      },
    );
  }
}

/**
 * @param {TestContext} t
 * @param {number} numberOfElements
 */
async function testPermutation(
  t,
  numberOfElements,
)
{
  await permutate(
    TEST_DATASET,
    numberOfElements,
    async (
      permutation,
    ) =>
    {
      const permutationString = permutation.map(
        (element) => `[${element.name}]`,
      ).join(" + ");

      await t.test(
        permutationString,
        (s) =>
        {
          let isRuntimeFree = true;
          let source = "";

          for (const element of permutation)
          {
            isRuntimeFree = isRuntimeFree && element.isRuntimeFree;
            source = source + element.code + "\n";
          }

          /**
           * @type {Mock<RuntimeFreeFileReporterCallbackFunction>}
           */
          const callback = s.mock.fn(
            cleanRuntimeFreeFile.bind(
              undefined,
              isRuntimeFree,
            ),
          );

          const transpiled = transpileCode(
            source,
            {
              callback,
            },
          );

          strictEqual(
            callback.mock.callCount(),
            1,
            "callback should be called once",
          );

          if (isRuntimeFree)
          {
            strictEqual(
              transpiled,
              "",
              "transpiled code should be empty",
            );
          }
          else
          {
            notStrictEqual(
              transpiled,
              "",
              "transpiled code should not be empty",
            );
          }
        },
      );
    },
  );
}

/**
 * @param {string} code
 * @param {RuntimeFreeFileReporterPluginOptions | null} [options]
 * @returns {string}
 */
function transpileCode(
  code,
  options,
)
{
  options ??= {};

  /**
   * @type {RuntimeFreeFileReporterPluginOptions}
   */
  const runtimeFreeFileReporterPluginOptions = {
    ...options,
  };

  const result = transformSync(
    code,
    {
      babelrc: false,
      babelrcRoots: false,
      browserslistConfigFile: false,
      configFile: false,
      cwd: __dirname,
      filename: __filename.substring(
        0,
        __filename.length - extname(__filename).length,
      ) + ".ts",
      plugins: [
        [
          runtimeFreeFileReporterPlugin,
          runtimeFreeFileReporterPluginOptions,
        ],
      ],
      presets: [
        [
          require.resolve("@babel/preset-typescript"),
          {
            dts: true,
          },
        ],
      ],
      root: __dirname,
      sourceType: "unambiguous",
    },
  );

  return result?.code ?? "";
}

void test(
  "detects empty source",
  (t) =>
  {
    /**
     * @type {Mock<RuntimeFreeFileReporterCallbackFunction>}
     */
    const callback = mock.fn(
      cleanRuntimeFreeFile.bind(
        undefined,
        true,
      ),
    );

    const transpiled = transpileCode(
      "",
      {
        callback,
      },
    );

    strictEqual(
      callback.mock.callCount(),
      1,
      "callback should be called once",
    );

    const expected = "";

    strictEqual(
      transpiled,
      expected,
      "transpiled code should be empty",
    );
  },
);

for (let i = 0; i < TEST_DATASET.length; i++)
{
  await test(
    async (t) =>
    {
      await testPermutation(t, i);
    },
  );
}

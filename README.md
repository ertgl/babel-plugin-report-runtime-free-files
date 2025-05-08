# 🌿 babel-plugin-report-runtime-free-files

[Babel](https://babeljs.io/) plugin that detects and reports files with or
without runtime-executing code.

## Table of Contents

- [Overview](#overview)
  - [Scope](#scope)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Technical Details](#technical-details)
  - [Non-runtime Constructs](#non-runtime-constructs)
- [Practical Example](#practical-example)
- [License](#license)

## Overview

This Babel plugin inspects a file and determines whether it includes any code
that runs at runtime. It reports the result to a callback function, allowing
developers to act on this information as needed.

<details>
  <summary>
    Example: Distribution output when building the plugin with itself
  </summary>

  The tree below shows the `dist` folder after building this plugin using the
  plugin itself. Files without runtime code are excluded from the `cjs` and
  `esm` folders, while their type declarations remain available under `types`.

  ```text
    dist
    ├── cjs
    │   ├── index.cjs
    │   ├── plugin.cjs
    │   ├── program.cjs
    │   └── visitor.cjs
    ├── esm
    │   ├── index.mjs
    │   ├── plugin.mjs
    │   ├── program.mjs
    │   └── visitor.mjs
    └── types
        ├── callback-function.d.ts
        ├── index.d.ts
        ├── plugin-options.d.ts
        ├── plugin.d.ts
        ├── post-handler-function.d.ts
        ├── pre-handler-function.d.ts
        ├── program.d.ts
        ├── visitor-options.d.ts
        └── visitor.d.ts
  ```
</details>

### Scope

The plugin classifies each file as either runtime or runtime-free. This makes
it possible to exclude unnecessary files from the final build, minimizing
distribution size and reducing payloads.

Runtime-free files may include:

- TypeScript files (not just `.d.ts`) that only declare types
- JavaScript files that contain only comments or `@typedef` annotations
- Completely empty files

This plugin does not modify or exclude any files by itself. It only reports
them. Decisions about what to do with the reported files are left to the
developer.

## Installation

The package is available on npm. It can be installed using any compatible
package manager.

```sh
npm install --save-dev babel-plugin-report-runtime-free-files
```

## Usage

Add the plugin to the Babel configuration, as shown in the example below.

```js
/**
 * @import {
 *   type Options as RuntimeFreeFileReporterOptions,
 * } from "babel-plugin-report-runtime-free-files";
 */

/**
 * @type {RuntimeFreeFileReporterOptions}
 */
const runtimeFreeFileReporterOptions = {
  callback: (
    programNode,
    programState,
    isRuntimeFree,
  ) =>
  {
    // Handle the result for the file here.
  },
  post: (file) =>
  {
    // Run logic after the plugin has processed this file.
  },
  pre: (file) =>
  {
    // Run logic before the plugin processes this file.
  },
};

module.exports = {
  plugins: [
    [
      require.resolve("babel-plugin-report-runtime-free-files"),
      runtimeFreeFileReporterOptions,
    ],
  ],
};
```

**Note:** Babel CLI transpiles files one by one. The `pre` and `post` hooks run
per file. To apply global logic across all files, consider using the Babel API
via `@babel/core` in a custom script. This allows one-time pre/post behavior
across the entire build process.

## Options

The plugin supports the following options:

- `callback`: Runs for each file processed.
  Parameters:
  - `programNode` (`NodePath<Program>`)
  - `programState` (`PluginPass`)
  - `isRuntimeFree` (`boolean`)
- `post`: Runs before processing a file.
  Parameters:
  - `file` (`BabelFile`)
- `pre`: Runs after processing a file.
  Parameters:
  - `file` (`BabelFile`)

## Technical Details

The logic for determining whether a file is runtime free is implemented in
the [`src/program.ts`](src/program.ts) file, within the `isProgramRuntimeFree`
function.

### Non-runtime Constructs

The following node types are considered non-runtime:

- `ImportDeclaration` with `importKind` set to `type`
- `ImportDeclaration` where all `specifiers` are `ImportSpecifier` with
  `importKind` set to `type` or `typeof`
- `TSImportEqualsDeclaration` with `importKind` set to `type`
- `ExportNamedDeclaration` with `exportKind` set to `type`
- `TSInterfaceDeclaration`
- `TSModuleDeclaration`
- `TSTypeAliasDeclaration`

If a file includes any node type outside this list, it is classified as
containing runtime code.

## Practical Example

This plugin is used in its own build process. Several source files contain only
type declarations:

- [`src/callback-function.ts`](src/callback-function.ts)
- [`src/plugin-options.ts`](src/plugin-options.ts)
- [`src/post-handler-function.ts`](src/post-handler-function.ts)
- [`src/pre-handler-function.ts`](src/pre-handler-function.ts)
- [`src/visitor-options.ts`](src/visitor-options.ts)

These files are omitted from `cjs` and `esm` outputs but remain available in
`types` as `.d.ts` files.

Build steps are defined in [`package.json`](package.json) file, and the
post-bootstrap script located in the [`hack`](hack) directory.

## License

This project is licensed under the
[MIT License](https://opensource.org/license/mit).
See the [LICENSE](LICENSE) file for details.

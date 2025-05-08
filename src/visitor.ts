import type {
  PluginPass,
  Visitor,
} from "@babel/core";

import type { VisitorOptions } from "./visitor-options";

import { isProgramRuntimeFree } from "./program";

export function createVisitor(
  options?: null | VisitorOptions,
): Visitor<PluginPass>
{
  options ??= {};

  const callback = options.callback;

  if (!callback)
  {
    return {};
  }

  return {
    Program: {
      exit(
        programPath,
        programState,
      )
      {
        callback(
          programPath,
          programState,
          isProgramRuntimeFree(programPath),
        );
      },
    },
  };
}

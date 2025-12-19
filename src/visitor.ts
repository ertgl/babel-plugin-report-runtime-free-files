import type {
  PluginPass,
  Visitor,
} from "@babel/core";

import { isProgramRuntimeFree } from "./program";
import type { VisitorOptions } from "./visitor-options";

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

import type { PluginAPI } from "@babel/core";
import { declare } from "@babel/helper-plugin-utils";

import type { Options } from "./plugin-options";
import { createVisitor } from "./visitor";

export const plugin = declare<Options>(
  (
    api: PluginAPI,
    options: null | Options | undefined,
    dirname: string,
  ) =>
  {
    options ??= {};

    return {
      post: options.post ?? undefined,
      pre: options.pre ?? undefined,
      visitor: createVisitor({
        callback: options.callback,
      }),
    };
  },
);

import type { BabelFile } from "@babel/core";

export type PreHandlerFunction = (
  file: BabelFile,
) => void;

import type { BabelFile } from "@babel/core";

export type PostHandlerFunction = (
  file: BabelFile,
) => void;

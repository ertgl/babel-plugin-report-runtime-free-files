import type { File } from "@babel/core";

export type PostHandlerFunction = (
  file: File,
) => void;

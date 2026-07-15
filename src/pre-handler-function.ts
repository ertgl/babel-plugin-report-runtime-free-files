import type { File } from "@babel/core";

export type PreHandlerFunction = (
  file: File,
) => void;

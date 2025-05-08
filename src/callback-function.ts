import type {
  NodePath,
  PluginPass,
} from "@babel/core";
import type { Program } from "@babel/types";

export type CallbackFunction = (
  programPath: NodePath<Program>,
  programState: PluginPass,
  isRuntimeFree: boolean,
) => void;

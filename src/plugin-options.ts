import type { CallbackFunction } from "./callback-function";
import type { PostHandlerFunction } from "./post-handler-function";
import type { PreHandlerFunction } from "./pre-handler-function";

export interface Options
{
  callback?: CallbackFunction | null;
  post?: null | PostHandlerFunction;
  pre?: null | PreHandlerFunction;
}

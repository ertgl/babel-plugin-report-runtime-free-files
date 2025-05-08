/**
 * @import {
 *   type NodePath,
 *   type PluginPass,
 * } from "@babel/core";
 * @import { type Program } from "@babel/types";
 *
 * @import {
 *   type Options as RuntimeFreeFileReporterOptions,
 * } from "../../src/plugin-options.js";
 */

/**
 * @returns {RuntimeFreeFileReporterOptions}
 */
export function createRuntimeFreeFileReporterOptions()
{
  /**
   * @param {NodePath<Program>} programPath
   * @param {PluginPass} programState
   * @param {boolean} isRuntimeFree
   */
  function callback(
    programPath,
    programState,
    isRuntimeFree,
  )
  {
    if (!isRuntimeFree)
    {
      return;
    }

    // @ts-expect-error - `isRuntimeFree` is not typed.
    programState.file.metadata.isRuntimeFree = isRuntimeFree;
  }

  return {
    callback,
  };
}

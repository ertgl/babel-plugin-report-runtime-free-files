import type { NodePath } from "@babel/core";
import type { Program } from "@babel/types";

export function isProgramRuntimeFree(
  programPath: NodePath<Program>,
): boolean
{
  return programPath.node.body.every(
    (node) =>
    {
      if (node.type === "ImportDeclaration")
      {
        return (
          node.importKind === "type"
          || node.specifiers.every(
            (specifier) =>
            {
              return (
                specifier.type === "ImportSpecifier"
                && (
                  specifier.importKind === "type"
                  || specifier.importKind === "typeof"
                )
              );
            },
          )
        );
      }

      if (node.type === "TSImportEqualsDeclaration")
      {
        return node.importKind === "type";
      }

      if (node.type === "ExportNamedDeclaration")
      {
        return node.exportKind === "type";
      }

      return (
        node.type === "TSInterfaceDeclaration"
        || node.type === "TSModuleDeclaration"
        || node.type === "TSTypeAliasDeclaration"
      );
    },
  );
}

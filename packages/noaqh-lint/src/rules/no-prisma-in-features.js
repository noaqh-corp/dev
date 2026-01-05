/**
 * @fileoverview features/ flow/ ディレクトリでは prisma への依存を禁止するルール
 * prisma への依存は repository 層に限定することを推奨
 */

/**
 * prisma関連のパッケージかどうかを判定
 */
function isPrismaImport(source) {
  if (!source) return false;
  const value = source.value || "";
  return (
    value === "@prisma/client" ||
    value.startsWith("@prisma/") ||
    value === "prisma" ||
    value.includes("/prisma")
  );
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "features/ flow/ ディレクトリでは prisma への依存を禁止します。prisma への依存は repository 層に限定してください。",
      recommended: true,
    },
    messages: {
      noPrismaInFeatures:
        "[error-2] features/ flow/ ディレクトリでは prisma への依存を禁止します。prisma への依存は repository 層に限定してください。",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const normalizedPath = filename.replace(/\\/g, "/");

    const isRestrictedDirectory =
      normalizedPath.includes("/features/") ||
      normalizedPath.includes("/flow/");

    if (!isRestrictedDirectory) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (isPrismaImport(node.source)) {
          context.report({
            node,
            messageId: "noPrismaInFeatures",
          });
        }
      },
      CallExpression(node) {
        // require("@prisma/client") のパターンも検出
        if (
          node.callee.name === "require" &&
          node.arguments.length > 0 &&
          node.arguments[0].type === "Literal" &&
          isPrismaImport(node.arguments[0])
        ) {
          context.report({
            node,
            messageId: "noPrismaInFeatures",
          });
        }
      },
    };
  },
};

export default rule;

/**
 * @fileoverview +server.ts / +page.server.ts では prisma を直接インポートしないルール
 * Repository経由でアクセスすることを推奨
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "+server.ts / +page.server.ts では prisma を直接インポートしないでください。Repository経由でアクセスしてください。",
      recommended: true,
    },
    messages: {
      noPrismaImport:
        "[repository-4] +server.ts / +page.server.ts では prisma に直接依存しないでください。Repository経由でアクセスしてください。",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const isServerFile =
      filename.endsWith("+server.ts") ||
      filename.endsWith("+page.server.ts") ||
      filename.endsWith("+server.js") ||
      filename.endsWith("+page.server.js");

    if (!isServerFile) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        // prisma関連のインポートをチェック
        if (
          source === "@prisma/client" ||
          source.includes("prisma") ||
          source.includes("$lib/server/prisma")
        ) {
          context.report({
            node,
            messageId: "noPrismaImport",
          });
        }
      },
    };
  },
};

export default rule;

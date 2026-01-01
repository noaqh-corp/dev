/**
 * @fileoverview +server.ts / +page.server.ts では try-catch を使用しないルール
 * エラーは hooks.server.ts で一括ハンドリングすることを推奨
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "+server.ts / +page.server.ts では try-catch を使用しないでください。エラーは hooks.server.ts で一括ハンドリングしてください。",
      recommended: true,
    },
    messages: {
      noTryCatch:
        "[error-1] +server.ts / +page.server.ts では try-catch を使用しないでください。エラーは hooks.server.ts で一括ハンドリングしてください。",
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
      TryStatement(node) {
        context.report({
          node,
          messageId: "noTryCatch",
        });
      },
    };
  },
};

export default rule;

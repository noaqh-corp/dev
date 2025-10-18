import { FastMCP } from "fastmcp";
import { renderTemplate } from "./features/prompt/util";
import { join } from "path";
import { getCodeStyleReviewPrompt } from "./features/prompt/query/get-code-style";

const server = new FastMCP({
  name: "noaqh-tools",
  version: "0.1.0",
  instructions:
    "Noaqhの開発支援ツールを提供します。",
});

server.addTool({
  name: "get_code_style_review",
  description: "コードスタイルをレビューするためのプロンプトを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: await getCodeStyleReviewPrompt()
        },
      ],
    };
  },

});

await server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
  },
});

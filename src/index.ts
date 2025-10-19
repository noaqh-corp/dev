import { FastMCP } from "fastmcp";
import { getBugCheckPrompt } from "./features/prompt/query/get-bug-check";
import { getCodeStyleReviewPrompt } from "./features/prompt/query/get-code-style";
import { getSddPrompt } from "./features/prompt/query/get-sdd";
import { readFileSync } from "fs";

const server = new FastMCP({
  name: "noaqh-tools",
  version: "0.1.0",
  instructions: "開発支援ツールを提供します。n:で始まるプロンプトを受け取った場合はnoaqh-toolsに設定されているツールを必ず使いなさい。",
});

server.addTool({
  name: "get_bug_check_prompt",
  description: "バグチェック用のプロンプトを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: await getBugCheckPrompt(),
        },
      ],
    };
  },
});

server.addTool({
  name: "get_code_style_review_prompt",
  description: "コードスタイルをレビューするためのプロンプトを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: await getCodeStyleReviewPrompt(),
        },
      ],
    };
  },
});

server.addTool({
  name: "get_sdd_prompt",
  description: "SDD(Spec Driven Development)、仕様書駆動開発用のプロンプトを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: await getSddPrompt(),
        },
      ],
    };
  },
});

server.addTool({
  name: "get_app_doc",
  description: "アプリ実装ガイドのドキュメントを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: readFileSync("docs/app.md", "utf-8"),
        },
      ],
    };
  },
});

server.addTool({
  name: "get_architecture_doc",
  description: "アーキテクチャのドキュメントを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: readFileSync("docs/architecture.md", "utf-8"),
        },
      ],
    };
  },
});

server.addTool({
  name: "get_code_style_doc",
  description: "コードスタイルのドキュメントを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: await getCodeStyleReviewPrompt(),
        },
      ],
    };
  },
});

await server.start({
  transportType: "httpStream",
  httpStream: {
    host: "0.0.0.0",
    port: 10000,
  },
});

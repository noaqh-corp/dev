import { FastMCP } from "fastmcp";
import { getBugCheckPrompt } from "./features/prompt/query/get-bug-check";
import { getCodeStyleReviewPrompt } from "./features/prompt/query/get-code-style";
import { readFileSync } from "fs";
import { resolve } from "path";

const server = new FastMCP({
  name: "noaqh-tools",
  version: "0.1.0",
  instructions: "開発支援ツールを提供します。n:で始まるプロンプトを受け取った場合はnoaqh-toolsに設定されているツールを必ず使いなさい。",
});

const docResources = [
  {
    description: "アプリ実装の方針とベストプラクティスをまとめたガイドです。",
    name: "アプリ実装ガイド",
    path: "docs/app.md",
    uri: "resource://docs/app",
  },
  {
    description: "システム全体のアーキテクチャに関するドキュメントです。",
    name: "アーキテクチャドキュメント",
    path: "docs/architecture.md",
    uri: "resource://docs/architecture",
  },
  {
    description: "コードスタイルやレビュー観点をまとめた資料です。",
    name: "コードスタイルガイド",
    path: "docs/code-style.md",
    uri: "resource://docs/code-style",
  },
  {
    description: "実装結果レポートのテンプレートです。",
    name: "実装結果レポートテンプレート",
    path: "docs/implementation_report_template.md",
    uri: "resource://docs/implementation-report-template",
  },
  {
    description: "仕様策定時に利用する計画テンプレートです。",
    name: "計画テンプレート",
    path: "docs/plan_template.md",
    uri: "resource://docs/plan-template",
  },
] as const;

for (const doc of docResources) {
  const absolutePath = resolve(doc.path);

  server.addResource({
    description: doc.description,
    mimeType: "text/markdown",
    name: doc.name,
    uri: doc.uri,
    async load() {
      return {
        text: readFileSync(absolutePath, "utf-8"),
      };
    },
  });
}

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
server.addTool({
  name: "get_implementation_report_template",
  description: "実装結果レポートのテンプレートを取得します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: readFileSync("docs/implementation_report_template.md", "utf-8"),
        },
      ],
    };
  },
})

await server.start({
  transportType: "httpStream",
  httpStream: {
    host: "0.0.0.0",
    port: 10000,
  },
});

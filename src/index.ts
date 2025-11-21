import { FastMCP } from "fastmcp";
import { readFileSync } from "fs";

const server = new FastMCP({
  name: "noaqh-tools",
  version: "0.1.0",
  instructions: "開発支援ツールを提供します。n:で始まるプロンプトを受け取った場合はnoaqh-toolsに設定されているツールを必ず使いなさい。",
});

const docs = [
  {
    name: "app",
    description: "アプリ実装ガイドのドキュメントを取得します。",
    path: "docs/app.md",
  },
  {
    name: "architecture",
    description: "アーキテクチャのドキュメントを取得します。",
    path: "docs/architecture.md",
  },
  {
    name: "code-style",
    description: "コードスタイルのドキュメントを取得します。",
    path: "docs/code-style.md",
  },
  {
    name: "implementation-report-template",
    description: "実装結果レポートのテンプレートを取得します。",
    path: "docs/implementation_report_template.md",
  },
  {
    name: "plan-template",
    description: "計画テンプレートを取得します。",
    path: "docs/plan_template.md",
  },
] as const;

for (const doc of docs) {
  server.addTool({
    name: doc.name,
    description: doc.description,
    annotations: {
      readOnlyHint: true,
    },
    async execute() {
      return {
        content: [
          {
            type: "text",
            text: readFileSync(doc.path, "utf-8"),
          },
        ],
      };
    },
  });
}

server.addTool({
  name: "health",
  description: "noaqh-toolsのMCPサーバーが接続できるか確認します。",
  annotations: {
    readOnlyHint: true,
  },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: "MCPサーバーが接続できます。",
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

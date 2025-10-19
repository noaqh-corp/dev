# Noaqh開発ツール

Noaqhプロジェクトの開発を支援するツール集です。開発ガイドライン、プロンプト集、およびMCPサーバーを提供します。

## 概要

このリポジトリは以下を提供します:

- **開発ドキュメント**: アーキテクチャ、実装ガイド、コードスタイルガイド
- **プロンプト集**: バグチェック、コードレビュー、設計書作成用のプロンプト
- **MCPサーバー**: 上記のドキュメントとプロンプトをMCP経由で利用可能

## ディレクトリ構成

```
.
├── docs/                    # 開発ドキュメント（外部公開）
│   ├── app.md              # アプリ実装ガイド
│   ├── architecture.md     # アーキテクチャドキュメント
│   └── code-style.md       # コードスタイルガイド
├── prompts/                # 生成されたプロンプト（外部公開）
│   ├── bug-check.md        # バグチェック用プロンプト
│   ├── code-style-review.md # コードレビュー用プロンプト
│   └── sdd.md              # SDD作成用プロンプト
├── template/prompts/       # プロンプトテンプレート
├── src/
│   ├── index.ts            # MCPサーバーのエントリーポイント
│   └── features/prompt/    # プロンプト生成ロジック
└── script/
    └── generate-prompt.ts  # プロンプト生成スクリプト
```

## 外部公開コンテンツ

`docs/`と`prompts/`ディレクトリは外部に公開されており、誰でも閲覧可能です。これらのドキュメントとプロンプトは、Noaqhプロジェクトの開発標準として参照できます。

## セットアップ

```bash
bun install
```

## プロンプトの生成

テンプレートからプロンプトを生成します:

```bash
bun run generate-prompt
```

このコマンドは`template/prompts/`内のテンプレートを処理し、`prompts/`ディレクトリに最終的なプロンプトファイルを生成します。

## MCPサーバーとして利用

### 提供されるツール

MCPサーバーは以下のツールを提供します:

#### プロンプト取得
- `get_bug_check_prompt` - バグチェック用プロンプト
- `get_code_style_review_prompt` - コードスタイルレビュー用プロンプト
- `get_sdd_prompt` - SDD（Software Design Document）作成用プロンプト

#### ドキュメント取得
- `get_app_doc` - アプリ実装ガイド
- `get_architecture_doc` - アーキテクチャドキュメント
- `get_code_style_doc` - コードスタイルガイド

### 1. ローカルでの動作確認（fastmcp CLI）

FastMCP付属のCLIからSTDIOサーバーを呼び出して、ツールが実行できるかを確認できます。

```bash
bunx fastmcp dev src/index.ts
```

起動後に表示されるプロンプトで `tool` コマンドを選び、任意のツール（例: `get_code_style_review_prompt`）を実行すると、対応するプロンプトやドキュメントが返ることを確認できます。終了する場合は `Ctrl+C` でサーバーを停止してください。

### 2. Cursorから利用する

Cursorでは `~/.cursor/mcp.json` にサーバーの起動コマンドを登録すると、MCPツールとして呼び出せます。例として、次の設定を追加してください（`bun` のパスや作業ディレクトリは環境に合わせて変更してください）。

```json
{
  "mcpServers": {
    "noaqh-tools": {
      "url": "https://dev-tool.noaqh.com/mcp"
    }
  }
}
```

ROOCode

    "noaqh-tool": {
      "type": "streamable-http",
      "url": "https://dev-tool.noaqh.com/mcp"
    },


Gemini cli
  "mcpServers": {
    "noaqh-tools": {
      "httpUrl": "https://dev-tool.noaqh.com/mcp"
    }
  }

設定を保存したら、Cursorのコマンドパレットで `MCP: Reload Servers` を実行するか、アプリを再起動してください。エディタ内でツールパネルを開くと、上記のツールが利用可能になります。

### 3. HTTPストリームサーバーとして起動

MCPサーバーはHTTPストリームモードでも起動できます:

```bash
bun run start
```

サーバーは `http://0.0.0.0:10000` で起動し、HTTP経由でMCPツールにアクセスできます。

## 技術スタック

- **Runtime**: [Bun](https://bun.com) - 高速なオールインワンJavaScriptランタイム
- **MCP Framework**: [FastMCP](https://github.com/modelcontextprotocol/fastmcp) - Model Context Protocol実装
- **Template Engine**: [Ecto](https://github.com/ecto/ecto) - テンプレート処理

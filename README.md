# Noaqh開発ツール
Noaqhプロジェクトの開発を支援するツール郡です。noaqh-devコマンドで利用できます。


## 提供する機能
### プロンプト、MCPインストール
開発フローに沿ったプロンプトを利用できるようにプロンプト、MCPをインストールします。対応するツールは以下の通りです。

- Cursor
- Claude Code
- Codex
- Roo Code 

## 提供するプロンプト
開発フローに沿ったプロンプトを提供します。

### 仕様書駆動開発-実装計画 prompts/sdd-1-plan.md
ユーザーから要求を受け取り、実装計画書を作成します。実装計画書のテンプレートはdocs/plan_template.mdから取得します。

### 仕様書駆動開発-実装 prompts/sdd-2-implementation.md
実装計画書をもとに実装を行い、実装結果レポートを作成します。実装結果レポートのテンプレートはdocs/implementation_report_template.mdから取得します。

### コミット prompt/commit.md
ステージングエリアの変更をもとにコミットメッセージを作成します。
 
### コードスタイルレビュー prompt/code-style-review.md
コードスタイルドキュメントをもとにコードをレビューします。


## 初期設定

### コマンドのインストール
noaqh-devコマンドをインストールします。

```bash
bun install -g github:noaqh-corp/dev # ツール郡をインストールします。
```
### コマンドのアップデート
コマンドをアップデートします。
```bash
```

### コマンドの動作確認
コマンドを実行し動作を確認します。Unknown command:などのエラーが出力されず、正常に動作したらインストール成功です。

```bash
noaqh-dev 
```

### プロンプトインストール
各ツールにプロンプトをインストールします。

```bash
noaqh-dev install-prompts
```

### MCPサーバーのインストール
MCPサーバーをインストールします。

```bash
noaqh-dev install-mcp
```

Cursorは上記コマンドでインストール不可なので、以下のコマンドでインストールしてください。

[Cursor MCPサーバーインストール](https://cursor.com/ja/install-mcp?name=noaqh-tools&config=eyJ1cmwiOiJodHRwczovL2Rldi10b29sLm5vYXFoLmNvbS9tY3AifQ%3D%3D)


--- 

# 開発者向け情報
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

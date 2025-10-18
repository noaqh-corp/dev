# dev_tool

## セットアップ

- 依存関係のインストール

  ```bash
  bun install
  ```

## MCPサーバーの起動と確認

### 1. ローカルでの動作確認（fastmcp CLI）

FastMCP付属のCLIからSTDIOサーバーを呼び出して、ツールが実行できるかを確認できます。

```bash
bunx fastmcp dev src/index.ts
```

起動後に表示されるプロンプトで `tool` コマンドを選び、`get_current_datetime` を実行すると、UTCのISO 8601文字列が返ることを確認できます。終了する場合は `Ctrl+C` でサーバーを停止してください。

### 2. Cursorから利用する

Cursorでは `~/.cursor/mcp.json` にサーバーの起動コマンドを登録すると、MCPツールとして呼び出せます。例として、次の設定を追加してください（`bun` のパスや作業ディレクトリは環境に合わせて変更してください）。

```json
{
  "mcpServers": {
    "currentDatetime": {
      "command": "/opt/homebrew/bin/bun",
      "args": ["run", "src/index.ts"],
      "cwd": "/Users/hal/dev/halst256/dev_tool"
    }
  }
}
```

設定を保存したら、Cursorのコマンドパレットで `MCP: Reload Servers` を実行するか、アプリを再起動してください。エディタ内でツールパネルを開くと `get_current_datetime` が利用可能になり、呼び出すと現在日時（UTC）のISO 8601文字列が返ります。

## 備考

- MCPサーバー自体を単体で起動したい場合は次のコマンドでも同じくSTDIOサーバーが立ち上がります。

  ```bash
  bun run src/index.ts
  ```

  このコマンドはクライアント（Cursor等）がSTDIO経由で接続することを前提としているため、単独で実行した場合はクライアントからの接続待ちで待機し続けます。

- このプロジェクトは `bun init` (bun v1.2.22) で生成されました。[Bun](https://bun.com) は高速なオールインワンのJavaScriptランタイムです。

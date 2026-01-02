# @noaqh/lint

noaqhプロジェクト用のOxlint設定

## インストール

```bash
bun add -D @noaqh/lint oxlint
```

## 使用方法（最小設定）

プロジェクトのルートに `.oxlintrc.json` を作成:

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@noaqh/lint/.oxlintrc.json"],
  "ignorePatterns": ["node_modules", "dist", "build", ".svelte-kit"]
}
```

これだけで以下が有効になります:

- **plugins**: `import`, `typescript`, `promise`, `unicorn`
- **categories**: `correctness`(error), `suspicious`(warn), `perf`(warn)
- **rules**: `no-console`, `eqeqeq`, `no-debugger`, `prefer-const`, `typescript/no-explicit-any` など

## lintの実行

```bash
bunx oxlint .
```

## 含まれる設定

### Categories

| カテゴリ | レベル |
|---------|--------|
| correctness | error |
| suspicious | warn |
| perf | warn |
| pedantic | off |
| style | off |
| restriction | off |

### 主要ルール

| ルール | レベル |
|--------|--------|
| no-unused-vars | error |
| no-console | warn |
| eqeqeq | error |
| no-debugger | error |
| no-var | error |
| prefer-const | error |
| typescript/no-explicit-any | error |
| typescript/no-non-null-assertion | warn |
| import/no-cycle | error |
| import/no-self-import | error |
| promise/no-return-wrap | error |

### 無効化されているルール

- `unicorn/no-null` - null 使用を許可
- `unicorn/filename-case` - ファイル名規則を強制しない

## ルールの上書き

プロジェクト固有のルールを追加・上書きできます:

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@noaqh/lint/.oxlintrc.json"],
  "ignorePatterns": ["node_modules", "dist"],
  "rules": {
    "no-console": "off",
    "typescript/no-explicit-any": "warn"
  }
}
```

## ignorePatterns について

`ignorePatterns` は extends で継承されません。各プロジェクトで設定してください。

推奨パターン:

```json
{
  "ignorePatterns": ["node_modules", "dist", "build", ".svelte-kit"]
}
```

## カスタムルール（オプション）

### `@noaqh/lint/no-try-catch-in-server`

`+server.ts` / `+page.server.ts` では try-catch を使用せず、`hooks.server.ts` で一括ハンドリングすることを推奨するルール。

```json
{
  "extends": ["./node_modules/@noaqh/lint/.oxlintrc.json"],
  "ignorePatterns": ["node_modules", "dist"],
  "jsPlugins": ["@noaqh/lint"],
  "rules": {
    "@noaqh/lint/no-try-catch-in-server": "error"
  }
}
```

## License

MIT

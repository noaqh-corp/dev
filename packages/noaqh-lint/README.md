# @noaqh/lint

noaqhプロジェクト用のOxlintプラグインと設定

## インストール

```bash
bun add -D github:noaqh-corp/noaqh-lint oxlint
```

## 使用方法

### 1. プラグインと設定を使用

プロジェクトのルートに `.oxlintrc.json` を作成:

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "jsPlugins": ["@noaqh/lint"],
  "rules": {
    "@noaqh/lint/no-try-catch-in-server": "error"
  }
}
```

### 2. lintの実行

```bash
bunx oxlint .
```

## ルール

### `@noaqh/lint/no-try-catch-in-server`

`+server.ts` / `+page.server.ts` では try-catch を使用しないでください。
エラーは `hooks.server.ts` で一括ハンドリングしてください。

#### 悪い例

```typescript
// src/routes/api/+server.ts
export async function GET() {
  try {
    const data = await fetchData();
    return json(data);
  } catch (e) {
    return json({ error: e.message }, { status: 500 });
  }
}
```

#### 良い例

```typescript
// src/routes/api/+server.ts
export async function GET() {
  const data = await fetchData();
  return json(data);
}

// src/hooks.server.ts
export const handleError = ({ error }) => {
  console.error(error);
  return {
    message: "Internal Server Error",
  };
};
```

## ベース設定

ベース設定のみを使用する場合:

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@noaqh/lint/.oxlintrc.json"]
}
```

## ignorePatterns

推奨する除外パターン:

```json
{
  "ignorePatterns": [
    "node_modules",
    ".svelte-kit",
    "dist",
    "build"
  ]
}
```

## License

MIT

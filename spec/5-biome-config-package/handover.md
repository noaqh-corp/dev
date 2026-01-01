# Lint設定パッケージ実装 - 引き継ぎドキュメント

作成日: 2026-01-01
更新日: 2026-01-01

## 最終結論

**BiomeからOxlintへ移行完了**

Biomeはnpmパッケージからのプラグイン配布をサポートしていないため、Oxlintに移行しました。

### 新しいリポジトリ

- **noaqh-lint**: https://github.com/noaqh-corp/noaqh-lint
- Oxlintベースのlintプラグインパッケージ

### 使用方法

```bash
bun add -D github:noaqh-corp/noaqh-lint oxlint
```

`.oxlintrc.json`:
```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "jsPlugins": ["@noaqh/lint"],
  "rules": {
    "@noaqh/lint/no-try-catch-in-server": "error"
  }
}
```

---

## Biomeの問題点（詳細調査結果）

### 調査で判明した事実

1. **Biomeはプラグインのnpm配布を公式にサポートしていない**
   - 意図的な設計決定（[Discussion #6265](https://github.com/biomejs/biome/discussions/6265)）
   - ESLintのようなプラグインエコシステムの断片化を避けるため
   - メンテナーの発言: "users can't distribute/share these plugins at the moment"

2. **`plugins`と`extends`のパス解決の違い**

   | 設定項目 | パッケージ名解決 | node_modules解決 |
   |----------|-----------------|------------------|
   | `extends` | ✅ サポート | ✅ サポート |
   | `plugins` | ❌ 非サポート | ❌ 非サポート |

3. **`extends`で読み込まれた設定内のプラグインパスはルートから解決される**
   - [Discussion #6681](https://github.com/biomejs/biome/discussions/6681)で報告
   - 設定ファイルの場所からではなく、ルートの設定ファイルの場所から解決
   - PR #8365は`extends: "//"`のみを修正、npmパッケージからの拡張は対象外

### 試した方法と結果

1. **相対パス**: `./grit/no-try-catch-in-server.grit` → ❌ Cannot read file
2. **パッケージexportsパス**: `@noaqh/biome-config/grit/...` → ❌ Cannot read file
3. **node_modulesへの相対パス**: `./node_modules/@noaqh/biome-config/grit/...` → ❌ Cannot read file（extendsと組み合わせると失敗）

### 結論

**「overridesを使わずに根本解決する」は、現在のBiomeの設計では技術的に不可能**

---

## Oxlintへの移行

### Oxlintを選んだ理由

| 項目 | Oxlint | Biome |
|------|--------|-------|
| npmプラグイン配布 | ✅ サポート | ❌ 非サポート |
| パッケージ名でのプラグイン参照 | ✅ 可能 | ❌ 不可能 |
| ESLint互換API | ✅ あり | ❌ GritQLのみ |
| GitHub Stars | ~18k | ~17k |
| 速度 | ESLintの50-100倍 | ESLintの15倍 |

### 実装したもの

#### パッケージ構造

```
noaqh-lint/
├── package.json
├── README.md
├── .oxlintrc.json          # ベース設定
└── src/
    ├── index.js            # プラグインエントリポイント
    └── rules/
        └── no-try-catch-in-server.js  # カスタムルール
```

#### カスタムルール: `no-try-catch-in-server`

`+server.ts` / `+page.server.ts` でのtry-catch使用を禁止するルール。
エラーは `hooks.server.ts` で一括ハンドリングすることを推奨。

### 動作確認結果

sample_todoで確認:
```
✅ bun add -D github:noaqh-corp/noaqh-lint oxlint → 正常にインストール
✅ bunx oxlint . → プラグインが正常に動作
✅ @noaqh/lint/no-try-catch-in-server → try-catchを検出
```

---

## 関連ファイル

### 新しいリポジトリ（Oxlint）
- https://github.com/noaqh-corp/noaqh-lint

### 旧リポジトリ（Biome - 非推奨）
- `packages/biome-config-noaqh/`
- https://github.com/noaqh-corp/biome-config-noaqh

### テストリポジトリ
- `sample_todo`（`/Users/hal/dev/halst256/sample_todo`）

## 参考情報

### Biome関連
- [Discussion #6265: Biome plugins distribution](https://github.com/biomejs/biome/discussions/6265)
- [Discussion #6681: plugins aren't resolved from config file](https://github.com/biomejs/biome/discussions/6681)
- [PR #8365: fix extends "//" plugin paths](https://github.com/biomejs/biome/pull/8365)

### Oxlint関連
- [Oxlint公式ドキュメント](https://oxc.rs/docs/guide/usage/linter.html)
- [JS Plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
- [Oxlint JS Plugins Preview](https://oxc.rs/blog/2025-10-09-oxlint-js-plugins.html)

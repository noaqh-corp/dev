# レビュールール追加ガイド

`noaqh-dev review`コマンドで使用されるレビュールールの追加・管理方法。

## ルールの種類

レビュールールは2種類に分類される：

| 種類 | 説明 | 実装場所 |
|------|------|----------|
| **oxlintルール** | 構文的に自動検出可能なルール | プロジェクトの`.oxlintrc.json` |
| **意味的ルール** | コードの意図・ドメイン知識が必要なルール | `docs/review.md` |

### oxlintルール化できるもの

- 未使用変数・インポートの検出
- console.logの検出
- any型の使用禁止
- 命名規則の強制

### 意味的ルール（Claude Codeレビューが必要）

- アーキテクチャパターンの違反（Core/Policy/Port禁止など）
- Input/Output型を作らない
- 関数名と処理内容の一致
- ドメインに適した命名
- データベース設計の問題

---

## oxlintルールの追加方法

プロジェクトルートに`.oxlintrc.json`を作成：

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "no-explicit-any": "error"
  }
}
```

**レベル**: `"error"` | `"warn"` | `"off"`

**参考**: https://oxc.rs/docs/guide/usage/linter.html

---

## 意味的ルールの追加方法

`docs/review.md`に追加：

```markdown
### [category-N] ルール名

**Bad:**
\`\`\`typescript
// 悪い例
\`\`\`

**Good:**
\`\`\`typescript
// 良い例
\`\`\`

**なぜそうするかの理由:**
説明文
```

**カテゴリ例**:
- `architecture-N`: アーキテクチャ関連
- `types-N`: 型定義関連
- `error-N`: エラーハンドリング関連
- `naming-N`: 命名関連
- `simplicity-N`: コードの簡潔性関連

---

## 動作確認方法

### 1. oxlintルール単体の確認

```bash
# プロジェクトディレクトリで実行
bunx oxlint src/routes/+page.server.ts
```

### 2. reviewコマンドの確認

**重要**: `noaqh-dev`はPATHに登録されていないため、`./bin/noaqh-dev`で直接実行する。

```bash
# プロジェクトディレクトリで実行

# 未コミット分のみ
/path/to/dev_tool/bin/noaqh-dev review --uncommitted

# ブランチ差分+未コミット分
/path/to/dev_tool/bin/noaqh-dev review

# ベースブランチ指定
/path/to/dev_tool/bin/noaqh-dev review --base develop
```

### 期待される出力例

```
=== oxlint ===
...

エラー: 3件、警告: 0件

=== Claude Codeレビュー ===
...
```

---

## 注意事項

- 意味的ルールはClaude Codeがレビュー時に参照するため、具体的なBad/Good例を必ず記載する

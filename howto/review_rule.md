# レビュールール追加ガイド

`noaqh-dev review`コマンドで使用されるレビュールールの追加・管理方法。

## ルールの種類

レビュールールは2種類に分類される：

| 種類 | 説明 | 実装場所 |
|------|------|----------|
| **biomeルール** | 構文的に自動検出可能なルール | `config/review/biome.json` |
| **意味的ルール** | コードの意図・ドメイン知識が必要なルール | `config/review/prompt.md` |

### biomeルール化できるもの

- 未使用変数・インポートの検出
- try-catchの使用禁止（特定ファイル）
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

## biomeルールの追加方法

### 1. 組み込みルールの追加

`config/review/biome.json`の`linter.rules`に追加：

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "complexity": {
        "noUselessCatch": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "suspicious": {
        "noConsole": "warn",
        "noExplicitAny": "error"
      }
    }
  }
}
```

**レベル**: `"error"` | `"warn"` | `"off"`

**参考**: https://biomejs.dev/linter/rules/

### 2. GritQLプラグインの追加（カスタムルール）

構文パターンを検出したい場合はGritQLプラグインを使用する。

#### 手順

1. `.grit`ファイルを作成

```bash
# config/review/no-try-catch-in-server.grit
```

```grit
`try { $body } catch ($err) { $handler }` where {
    register_diagnostic(
        span = $body,
        message = "[error-1] +server.ts / +page.server.ts では try-catch を使用しないでください。"
    )
}
```

2. `biome.json`のoverridesでファイルパターンを指定してプラグインを有効化

```json
{
  "overrides": [
    {
      "includes": ["**/+server.ts", "**/+page.server.ts"],
      "plugins": ["./no-try-catch-in-server.grit"]
    }
  ]
}
```

#### GritQL構文

```grit
`マッチパターン` where {
    register_diagnostic(
        span = $変数,
        message = "エラーメッセージ",
        severity = "error"  // "error" | "warn" | "info" | "hint"
    )
}
```

**よく使うパターン**:
- `` `try { $body } catch ($err) { $handler }` `` - try-catch文
- `` `console.log($args)` `` - console.log呼び出し
- `` `async function $name($args) { $body }` `` - async関数

**参考**: https://biomejs.dev/linter/plugins/

---

## 意味的ルールの追加方法

`config/review/prompt.md`に追加：

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

### 推奨: sample_todoリポジトリを使う

動作確認にはsample_todoリポジトリを使用することを推奨。SvelteKitプロジェクトでtry-catchルールなどを確認できる。

```bash
# sample_todoをクローン
git clone https://github.com/noaqh-corp/sample_todo
cd sample_todo
```

### 1. biomeルール単体の確認

```bash
# dev_toolディレクトリからの相対パスで実行
cd sample_todo
bunx biome lint --config-path=../config/review/biome.json src/routes/+page.server.ts

# または絶対パスで指定
bunx biome lint --config-path=/path/to/dev_tool/config/review/biome.json src/routes/+page.server.ts
```

### 2. reviewコマンドの確認

**重要**: `noaqh-dev`はPATHに登録されていないため、`./bin/noaqh-dev`で直接実行する。

```bash
# sample_todoディレクトリで実行
cd sample_todo

# 未コミット分のみ
/path/to/dev_tool/bin/noaqh-dev review --uncommitted

# ブランチ差分+未コミット分
/path/to/dev_tool/bin/noaqh-dev review

# ベースブランチ指定
/path/to/dev_tool/bin/noaqh-dev review --base develop
```

### 3. テスト用に一時的な変更を加える

```bash
cd sample_todo

# 変更を加える
echo "// test" >> src/routes/+page.server.ts

# reviewコマンドを実行
/path/to/dev_tool/bin/noaqh-dev review --uncommitted

# 変更を元に戻す
git checkout src/routes/+page.server.ts
```

### 期待される出力例

`+page.server.ts`にtry-catchが含まれている場合：

```
=== biome lint ===
src/routes/+page.server.ts:53:4 plugin ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  × [error-1] +server.ts / +page.server.ts では try-catch を使用しないでください。
    エラーは hooks.server.ts で一括ハンドリングしてください。

エラー: 3件、警告: 0件

=== Claude Codeレビュー ===
...
```

---

## 現在のルール一覧

### biome.jsonで定義済みのルール

| ルール | レベル | 対応するレビュールール |
|--------|--------|------------------------|
| `noUselessCatch` | error | [error-1] 不要なtry-catchを避ける |
| `noUnusedVariables` | error | [simplicity-3] 不要なコードを削除する |
| `noUnusedImports` | error | [simplicity-3] 不要なコードを削除する |
| `noConsole` | warn | [misc-4] 動作確認用の関数を残さない |
| `noExplicitAny` | error | [types-3] nullableな引数を避ける（関連） |
| `useNamingConvention` | warn | [naming-1] 意図が明確な変数名を使う |

### GritQLプラグインで定義済みのルール

| ファイル | 対象 | 説明 |
|----------|------|------|
| `no-try-catch-in-server.grit` | `+server.ts`, `+page.server.ts` | try-catch禁止 |

---

## ファイル構成

```
config/review/
├── biome.json                    # biome設定（ルール・プラグイン設定）
├── prompt.md                     # 意味的ルール（Claude Codeレビュー用）
└── no-try-catch-in-server.grit   # GritQLプラグイン
```

---

## 注意事項

- biome v2.x以降が必要（GritQLプラグイン使用のため）
- GritQLプラグインはoverridesのincludesでファイルパターンを指定する
- 意味的ルールはClaude Codeがレビュー時に参照するため、具体的なBad/Good例を必ず記載する

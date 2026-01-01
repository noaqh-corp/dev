# 機能仕様書: プロンプトインストール時のパスプレースホルダー変換

機能名: `3-path-placeholder`
作成日: 2025-12-30
モデル名: Claude Opus 4.5
仕様書テンプレートバージョン: 1.0.1

## 概要

プロンプトインストール時に `{{path("相対パス")}}` プレースホルダーを絶対パスに変換する

## 要件

### 機能実装前後の変更点

#### 機能実装前

- `prompts/sdd-1-plan.md` などのプロンプトファイルには HTTP URL（`https://raw.githubusercontent.com/noaqh-corp/dev/...`）が記載されている
- Claude Code や Codex でプロンプトを実行すると、HTTP URL からドキュメントを取得する際に内容が省略されてしまう
- インストール時（`installPrompts`, `installClaudeCodePrompts` など）は単純にファイルをコピーするだけで、内容の変換は行わない

#### 機能実装後

- `prompts/*.md` ファイル内の HTTP URL を `{{path("相対パス")}}` プレースホルダーに置き換える
- インストール時に `{{path("相対パス")}}` をプロジェクトルートからの絶対パスに変換する
- Claude Code や Codex でプロンプトを実行すると、ローカルファイルから直接ドキュメントを読み込める

### 機能要件

- FR-001: システムはプロンプトファイル内の `{{path("相対パス")}}` プレースホルダーを検出できなければならない (path_placeholder)_1
- FR-002: システムはプレースホルダーをプロジェクトルートからの絶対パスに変換できなければならない (path_placeholder)_1
- FR-003: すべてのインストール関数（`installPrompts`, `installClaudeCodePrompts`, `installRooPrompts`, `installCodexSkillsPrompts`, `installClaudeSkillsPrompts`）でプレースホルダー変換が適用されなければならない (path_placeholder)_2
- FR-004: `prompts/` 配下のsdd関連ファイル（`sdd-1-plan.md`, `sdd-2-impl.md`, `sdd-auto.md`, `fix-pr-review-1-plan.md`）の HTTP URL がプレースホルダーに変更されなければならない (path_placeholder)_3

### エンティティ構造

エンティティの変更はありません。本機能はファイル処理のみで、データベースやデータ構造の変更は不要です。

## 成功基準

- プロンプトインストール後、生成されたファイル内に `{{path(...)}}` が残っていないこと
- 生成されたファイル内のパスが絶対パス（例: `/Users/.../dev_tool/docs/architecture.md`）になっていること
- すべての既存テストが引き続きパスすること

### 型定義

新規型定義は不要です。

## 実装手順

### 実装セット test_helper: テストヘルパー

テストヘルパーは不要です。理由: 本機能はファイル処理のみでデータベース操作を行わないため、`removeAllDataFromDatabase`や`initDatabase`などのDB関連ヘルパーは不要です。また、テスト用のデータ作成もファイルシステム操作で直接行えるため、共通のテストヘルパー関数を追加する必要がありません。

### 実装セット (path_placeholder)_1: プレースホルダー変換ユーティリティ

プレースホルダー `{{path("相対パス")}}` を絶対パスに変換するユーティリティ関数を実装します。

- 対象ファイル:
  - `src/features/prompt/util.ts` (修正)
  - `src/features/prompt/util.test.ts` (新規追加)

- 実装関数:
  - `replacePathPlaceholders(content: string, projectRoot: string): string`
    - 実装内容: プロンプト内容の `{{path("相対パス")}}` を `${projectRoot}/${相対パス}` に変換する
    - テスト項目:
      - 単一のプレースホルダーを正しく変換できる
      - 複数のプレースホルダーを正しく変換できる
      - プレースホルダーがない場合は内容をそのまま返す
      - ネストしたパス（例: `docs/sub/file.md`）も正しく変換できる

- 手順:
  - [x] `replacePathPlaceholders`関数を実装(src/features/prompt/util.ts)
  - [x] `replacePathPlaceholders`関数のテストを作成(src/features/prompt/util.test.ts)
  - [x] `bun test src/features/prompt/util.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。

### 実装セット (path_placeholder)_2: インストールハンドラの修正

各インストール関数で、ファイルコピー時にプレースホルダー変換を適用します。

- 対象ファイル:
  - エントリーポイント:
    - `src/features/prompt/command/install-prompts/handler.ts` (修正)
      - 関数: `installPrompts(options?: InstallPromptsOptions): Promise<InstallPromptsResult>`
      - 実装前状態: `copyFile(sourcePath, destinationPath)` でファイルをコピー
      - 実装後状態: `readFile` → `replacePathPlaceholders` → `writeFile` でプレースホルダーを変換してから書き出し
      - 実装内容: ファイルコピー処理をプレースホルダー変換処理に置き換える
      - 使用するPort: なし
    - 関数: `installClaudeCodePrompts(options?: InstallPromptsOptions): Promise<InstallPromptsResult>`
      - 実装前状態: `copyFile(sourcePath, destinationPath)` でファイルをコピー
      - 実装後状態: `readFile` → `replacePathPlaceholders` → `writeFile` でプレースホルダーを変換してから書き出し
      - 実装内容: ファイルコピー処理をプレースホルダー変換処理に置き換える
      - 使用するPort: なし
    - 関数: `installRooPrompts(options?: InstallPromptsOptions): Promise<InstallPromptsResult>`
      - 実装前状態: `copyFile(sourcePath, destinationPath)` でファイルをコピー
      - 実装後状態: `readFile` → `replacePathPlaceholders` → `writeFile` でプレースホルダーを変換してから書き出し
      - 実装内容: ファイルコピー処理をプレースホルダー変換処理に置き換える
      - 使用するPort: なし
    - 関数: `installCodexSkillsPrompts(options?: InstallPromptsOptions): Promise<InstallPromptsResult>`
      - 実装前状態: `readFile` → `writeFile` でファイルを読み込み、YAMLフロントマターを追加して書き出し
      - 実装後状態: `readFile` → `replacePathPlaceholders` → YAMLフロントマター追加 → `writeFile`
      - 実装内容: 既存の処理に`replacePathPlaceholders`を追加
      - 使用するPort: なし
    - 関数: `installClaudeSkillsPrompts(options?: InstallPromptsOptions): Promise<InstallPromptsResult>`
      - 実装前状態: `readFile` → `writeFile` でファイルを読み込み、YAMLフロントマターを追加して書き出し
      - 実装後状態: `readFile` → `replacePathPlaceholders` → YAMLフロントマター追加 → `writeFile`
      - 実装内容: 既存の処理に`replacePathPlaceholders`を追加
      - 使用するPort: なし

- 対象テストファイル:
  - `src/features/prompt/command/install-prompts/handler.test.ts` (新規追加)
    - テスト項目:
      - installPromptsでプレースホルダーが絶対パスに変換される
      - installClaudeCodePromptsでプレースホルダーが絶対パスに変換される
      - installRooPromptsでプレースホルダーが絶対パスに変換される
      - installCodexSkillsPromptsでプレースホルダーが絶対パスに変換される
      - installClaudeSkillsPromptsでプレースホルダーが絶対パスに変換される

- 実装内容: 各インストール関数内の `copyFile` を `readFile` + `replacePathPlaceholders` + `writeFile` に置き換える。Skills系関数では既存の`readFile`後に`replacePathPlaceholders`を追加する。共通処理は内部ヘルパー関数として抽出する。

- 手順:
  - [x] 共通のファイル変換処理を行うヘルパー関数 `copyFileWithPlaceholderReplacement` を実装(src/features/prompt/command/install-prompts/handler.ts)
  - [x] `installPrompts`関数内の`copyFile`を`copyFileWithPlaceholderReplacement`に置き換え(src/features/prompt/command/install-prompts/handler.ts)
  - [x] `installClaudeCodePrompts`関数内の`copyFile`を`copyFileWithPlaceholderReplacement`に置き換え(src/features/prompt/command/install-prompts/handler.ts)
  - [x] `installRooPrompts`関数内の`copyFile`を`copyFileWithPlaceholderReplacement`に置き換え(src/features/prompt/command/install-prompts/handler.ts)
  - [x] `installCodexSkillsPrompts`関数内の`readFile`後に`replacePathPlaceholders`を追加(src/features/prompt/command/install-prompts/handler.ts)
  - [x] `installClaudeSkillsPrompts`関数内の`readFile`後に`replacePathPlaceholders`を追加(src/features/prompt/command/install-prompts/handler.ts)
  - [x] ハンドラのテストを作成(src/features/prompt/command/install-prompts/handler.test.ts)
    - installPromptsでプレースホルダーが絶対パスに変換される
    - installClaudeCodePromptsでプレースホルダーが絶対パスに変換される
    - installRooPromptsでプレースホルダーが絶対パスに変換される
    - installCodexSkillsPromptsでプレースホルダーが絶対パスに変換される
    - installClaudeSkillsPromptsでプレースホルダーが絶対パスに変換される
  - [x] `bun test src/features/prompt/command/install-prompts/handler.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。
  - [x] コードスタイルを参考にしながらリファクタリングを行う(src/features/prompt/command/install-prompts/handler.ts)
  - [x] `bun test src/features/prompt/command/install-prompts/handler.test.ts`を実行しテストが通ることを確認する。

### 実装セット (path_placeholder)_3: プロンプトファイルのプレースホルダー化

`prompts/` 配下のファイル内の HTTP URL を `{{path(...)}}` プレースホルダーに変更します。

- 対象ファイル:
  - `prompts/sdd-1-plan.md` (修正)
  - `prompts/sdd-2-impl.md` (修正)
  - `prompts/sdd-auto.md` (修正)
  - `prompts/fix-pr-review-1-plan.md` (修正)

- 実装内容: 以下のURLをプレースホルダーに変更する

  | 変更前 | 変更後 |
  | --- | --- |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/architecture.md` | `{{path("docs/architecture.md")}}` |
  | `https://github.com/noaqh-corp/dev/blob/main/docs/architecture.md` | `{{path("docs/architecture.md")}}` |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/plan_template.md` | `{{path("docs/plan_template.md")}}` |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/review.md` | `{{path("docs/review.md")}}` |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/prompts/code-style-review.md` | `{{path("prompts/code-style-review.md")}}` |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/implementation_report_template.md` | `{{path("docs/implementation_report_template.md")}}` |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/prompts/sdd-1-plan.md` | `{{path("prompts/sdd-1-plan.md")}}` |
  | `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/prompts/sdd-2-impl.md` | `{{path("prompts/sdd-2-impl.md")}}` |

- 手順:
  - [x] `prompts/sdd-1-plan.md`内のHTTP URLをプレースホルダーに変更
  - [x] `prompts/sdd-2-impl.md`内のHTTP URLをプレースホルダーに変更
  - [x] `prompts/sdd-auto.md`内のHTTP URLをプレースホルダーに変更
  - [x] `prompts/fix-pr-review-1-plan.md`内のHTTP URLをプレースホルダーに変更
  - [x] すべてのテストを実行し、既存機能に影響がないことを確認 `bun test`
  - [x] `bunx tsc --noEmit`を実行し、型エラーがないことを確認

## 影響ページ

- なし（CLIツールのため、UIページへの影響はありません）

## 確認すべき項目

### ローカル確認できる項目

- プレースホルダー変換の動作確認:
  - 確認すべき理由: プレースホルダーが正しく絶対パスに変換されることを確認するため
  - 確認すべき内容: インストール後のファイルに `{{path(...)}}` が残っておらず、絶対パスに変換されていること
  - 確認方法:
    1. `bun run src/cli.ts install-prompts` を実行
    2. `~/.codex/prompts/n-sdd-1-plan.md` の内容を確認
    3. `{{path(...)}}` が絶対パス（例: `/Users/.../dev_tool/docs/architecture.md`）に変換されていることを確認

- Claude Code用インストールの動作確認:
  - 確認すべき理由: Claude Codeでプロンプトが正しく動作することを確認するため
  - 確認すべき内容: インストール後のファイルに絶対パスが記載されていること
  - 確認方法:
    1. `bun run src/cli.ts install-prompts` を実行
    2. `~/.claude/commands/n-sdd-1-plan.md` の内容を確認
    3. 絶対パスが正しく設定されていることを確認

### デプロイ環境でのみ確認できる項目

- bunxでのインストール動作確認:
  - 確認すべき理由: `bunx noaqh-dev install-prompts` での動作を確認するため
  - 確認すべき内容: bunxでインストールした場合も絶対パスが正しく設定されること
  - 確認方法:
    1. `bunx noaqh-dev install-prompts` を実行
    2. インストール先のファイル内容を確認
    3. 絶対パスがbunxのインストールパスを基準に設定されていることを確認

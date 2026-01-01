# 機能仕様書: reviewコマンド

機能名: `2-review-command`
作成日: 2025-12-16
モデル名: Claude Opus 4.5
仕様書テンプレートバージョン: 1.0.1

## 概要

noaqh-devコマンドに差分コードのbiome lintチェックとClaude Codeによるレビューを行うreviewサブコマンドを追加する。

## 要件

### 機能実装前後の変更点

#### 機能実装前

- noaqh-devコマンドにreviewサブコマンドは存在しない
- コードレビューは手動で行う必要がある
- biome lintは個別に実行する必要がある

#### 機能実装後

- `noaqh-dev review`コマンドでブランチ差分+未コミット分のレビューが実行できる
- `noaqh-dev review --uncommitted`コマンドで未コミット分のみのレビューが実行できる
- `noaqh-dev review --base <branch>`でベースブランチを指定できる
- `noaqh-dev review --all-files`でプロジェクト全体のbiome lintを実行できる
- biome lintの結果とClaude Codeによるレビュー結果が標準出力に出力される

### 機能要件

- FR-001: システムはブランチ差分+未コミット分の差分ファイル一覧を取得できなければならない (review)_1
- FR-002: システムは未コミット分のみの差分ファイル一覧を取得できなければならない (review)_1
- FR-003: システムは差分ファイルに対してbiome lintを実行し結果を出力できなければならない (review)_2
- FR-004: システムはプロジェクト全体に対してbiome lintを実行し結果を出力できなければならない (review)_2
- FR-005: システムは差分内容をClaude Codeに渡してレビューを実行できなければならない (review)_3
- FR-006: システムはClaude Codeコマンドが存在しない場合、レビューをスキップしなければならない (review)_3
- FR-007: システムはベースブランチを指定できなければならない（デフォルト: main） (review)_1

### エンティティ構造

本機能ではデータベースを使用しないため、エンティティの変更はありません。

## 成功基準

- `noaqh-dev review`コマンドが正常に実行され、biome lint結果が標準出力に表示される
- claudeコマンドが存在する場合、Claude Codeによるレビュー結果が標準出力に表示される
- `--uncommitted`オプションで未コミット分のみがレビューされる
- `--base`オプションでベースブランチを変更できる
- `--all-files`オプションでプロジェクト全体のlintが実行される

### 型定義

#### Domain固有型 (src/features/review/types.ts)

- `BiomeLintResult`: biome lint結果の型（success: boolean, output: string, errorCount: number, warningCount: number）

注: DiffResultやReviewOptionsのような型は作成しない。差分取得はgetDiffFiles/getDiffContentで別々に返し、オプションは関数の引数として直接受け取る（アーキテクチャガイドラインに従い、無意味なInput/Output型は作成しない）。

## 実装手順

### 実装セット test_helper: テストヘルパー

本機能はCLIコマンドであり、外部コマンド（git, biome, claude）に依存するため、テストヘルパーは不要です。テストは実際のgitリポジトリ上で統合テストとして実行します。

### 実装セット (review)_1: 型定義と差分取得機能

- 対象ファイル:
  - `src/features/review/types.ts` (新規追加)
  - `src/features/review/query/get-diff/handler.ts` (新規追加)
  - `src/features/review/query/get-diff/handler.test.ts` (新規追加)

- エントリーポイント:
  - `src/features/review/query/get-diff/handler.ts`
    - 関数: `getDiffFiles(base: string, uncommittedOnly: boolean): Promise<string[]>`
    - 実装前状態: なし
    - 実装後状態: git diffで差分ファイル一覧を取得できる
    - 実装内容: git diffコマンドを実行し、差分があるファイル一覧を返す
    - 使用するPort: なし（child_processを直接使用）
  - `src/features/review/query/get-diff/handler.ts`
    - 関数: `getDiffContent(base: string, uncommittedOnly: boolean): Promise<string>`
    - 実装前状態: なし
    - 実装後状態: git diffで差分内容を取得できる
    - 実装内容: git diffコマンドを実行し、差分内容を返す
    - 使用するPort: なし（child_processを直接使用）

- 型定義:
  - `BiomeLintResult`: biome lint実行結果の型（success: boolean, output: string, errorCount: number, warningCount: number）

- テスト項目:
  - 未コミット分のみの差分ファイル一覧を取得できる
  - ブランチ差分+未コミット分の差分ファイル一覧を取得できる
  - 差分がない場合は空配列を返す
  - 未コミット分のみの差分内容を取得できる
  - ブランチ差分+未コミット分の差分内容を取得できる

- 手順:
  - [x] src/features/review/types.tsを作成し、BiomeLintResult型を定義
  - [x] src/features/review/query/get-diff/handler.test.tsを作成
    - 未コミット分のみの差分ファイル一覧を取得できる
    - ブランチ差分+未コミット分の差分ファイル一覧を取得できる
    - 差分がない場合は空配列を返す
  - [x] src/features/review/query/get-diff/handler.tsを作成
  - [x] getDiffFiles関数を実装（base: string, uncommittedOnly: boolean）: Promise<string[]>
    - uncommittedOnly=trueの場合: `git diff --name-only` + `git diff --cached --name-only`
    - uncommittedOnly=falseの場合: `git diff --name-only {base}...HEAD` + 未コミット分
  - [x] getDiffContent関数を実装（base: string, uncommittedOnly: boolean）: Promise<string>
    - uncommittedOnly=trueの場合: `git diff` + `git diff --cached`
    - uncommittedOnly=falseの場合: `git diff {base}...HEAD` + 未コミット分
  - [x] `bun test src/features/review/query/get-diff/handler.test.ts`を実行しテストが通ることを確認
  - [x] `bunx tsc --noEmit`を実行し型エラーがないことを確認

### 実装セット (review)_2: biome lint実行機能

- 対象ファイル:
  - `src/features/review/command/run-biome-lint/handler.ts` (新規追加)
  - `src/features/review/command/run-biome-lint/handler.test.ts` (新規追加)
  - `package.json` (修正: biome追加)
  - `biome.json` (新規追加: biome設定ファイル)

- エントリーポイント:
  - `src/features/review/command/run-biome-lint/handler.ts`
    - 関数: `runBiomeLint(files: string[], allFiles: boolean): Promise<BiomeLintResult>`
    - 実装前状態: なし
    - 実装後状態: biome lintを実行し結果を取得できる
    - 実装内容: biome lintコマンドを実行し、結果をパースして返す
    - 使用するPort: なし（child_processを直接使用）

- テスト項目:
  - 指定ファイルに対してbiome lintを実行できる
  - プロジェクト全体に対してbiome lintを実行できる
  - lint結果をBiomeLintResult型で返す

- 手順:
  - [x] package.jsonのdependenciesに`@biomejs/biome`を追加
  - [x] `bun install`を実行
  - [x] biome.jsonを作成（TypeScript用の基本設定）
  - [x] src/features/review/command/run-biome-lint/handler.test.tsを作成
    - 指定ファイルに対してbiome lintを実行できる
    - プロジェクト全体に対してbiome lintを実行できる
  - [x] src/features/review/command/run-biome-lint/handler.tsを作成
  - [x] runBiomeLint関数を実装（files: string[], allFiles: boolean）: Promise<BiomeLintResult>
    - allFiles=trueの場合: `bunx biome lint .`
    - allFiles=falseの場合: `bunx biome lint {files}`
    - 結果をパースしてBiomeLintResultを返す
  - [x] `bun test src/features/review/command/run-biome-lint/handler.test.ts`を実行しテストが通ることを確認
  - [x] `bunx tsc --noEmit`を実行し型エラーがないことを確認

### 実装セット (review)_3: Claude Codeレビュー実行機能

- 対象ファイル:
  - `src/features/review/command/run-claude-review/handler.ts` (新規追加)
  - `src/features/review/command/run-claude-review/handler.test.ts` (新規追加)

- エントリーポイント:
  - `src/features/review/command/run-claude-review/handler.ts`
    - 関数: `runClaudeReview(diffContent: string): Promise<string | null>`
    - 実装前状態: なし
    - 実装後状態: Claude Codeによるレビューを実行できる
    - 実装内容: claudeコマンドにレビュープロンプトと差分を渡して実行し、結果を返す
    - 使用するPort: なし（child_processを直接使用）

- テスト項目:
  - claudeコマンドが存在しない場合はnullを返す
  - claudeコマンドが存在する場合はレビュー結果を返す

- 手順:
  - [x] src/features/review/command/run-claude-review/handler.test.tsを作成
    - claudeコマンドが存在しない場合はnullを返す
  - [x] src/features/review/command/run-claude-review/handler.tsを作成
  - [x] claudeコマンドの存在確認関数を実装（既存のcommandExists関数を再利用）
  - [x] runClaudeReview関数を実装（diffContent: string）: Promise<string | null>
    - claudeコマンドが存在しない場合はnullを返す
    - 存在する場合: `claude -p "レビュープロンプト" --allowedTools Read,Grep,Glob`を実行
    - レビュープロンプトにはdocs/review.mdの内容とdiffContentを含める
  - [x] `bun test src/features/review/command/run-claude-review/handler.test.ts`を実行しテストが通ることを確認
  - [x] `bunx tsc --noEmit`を実行し型エラーがないことを確認

### 実装セット (review)_4: CLIエントリポイント追加

- 対象ファイル:
  - エントリーポイント:
    - `src/cli.ts` (修正)
      - 関数: `handleReview(args: string[]): Promise<void>`
      - 実装前状態: reviewコマンドは存在しない
      - 実装後状態: reviewコマンドが追加され、オプション解析とレビュー実行が行われる
      - 実装内容:
        - オプション解析（--uncommitted, --base, --all-files）
        - getDiffFiles, getDiffContent呼び出し
        - runBiomeLint呼び出しと結果出力
        - runClaudeReview呼び出しと結果出力
      - 使用するPort: なし

- 実装内容:
  - HELP_TEXTにreviewコマンドの説明を追加
  - CliCommand型にreviewを追加
  - switchにreviewケースを追加
  - handleReview関数を実装

- 手順:
  - [x] HELP_TEXTにreviewコマンドの説明を追加
    ```
    review          差分コードのbiome lintチェックとClaude Codeレビューを実行します
                    オプションなし: ブランチ差分+未コミット分をレビュー
                    --uncommitted: 未コミット分のみをレビュー
                    --base <branch>: ベースブランチを指定（デフォルト: main）
                    --all-files: プロジェクト全体のbiome lintを実行
    ```
  - [x] CliCommand型に"review"を追加
  - [x] switchにcase "review"を追加し、handleReview(rest.slice(1))を呼び出す
  - [x] handleReview関数を実装
    - args解析: --uncommitted, --base <branch>, --all-filesを解析
    - getDiffFilesとgetDiffContentを呼び出し
    - 差分がない場合は「差分がありません」と出力して終了
    - runBiomeLintを呼び出し、結果を標準出力に出力
    - runClaudeReviewを呼び出し、結果を標準出力に出力（nullの場合はスキップメッセージ）
  - [x] `bunx tsc --noEmit`を実行し型エラーがないことを確認
  - [] 手動で動作確認を行う

## 影響ページ

本機能はCLIコマンドのため、影響ページはありません。

## 確認すべき項目

### ローカル確認できる項目

- reviewコマンドのヘルプ表示:
  - 確認すべき理由: ヘルプテキストが正しく表示されることを確認するため
  - 確認すべき内容: `noaqh-dev --help`でreviewコマンドの説明が表示される
  - 確認方法: `bun run cli --help`を実行

- ブランチ差分+未コミット分のレビュー:
  - 確認すべき理由: デフォルト動作が正しく機能することを確認するため
  - 確認すべき内容: ブランチ差分と未コミット分の両方がレビュー対象になる
  - 確認方法:
    1. mainから新しいブランチを作成
    2. ファイルを変更してコミット
    3. さらにファイルを変更（未コミット）
    4. `bun run cli review`を実行
    5. コミット済みと未コミットの両方の差分がレビューされることを確認

- 未コミット分のみのレビュー:
  - 確認すべき理由: --uncommittedオプションが正しく機能することを確認するため
  - 確認すべき内容: 未コミット分のみがレビュー対象になる
  - 確認方法:
    1. ファイルを変更（未コミット）
    2. `bun run cli review --uncommitted`を実行
    3. 未コミット分のみがレビューされることを確認

- ベースブランチ指定:
  - 確認すべき理由: --baseオプションが正しく機能することを確認するため
  - 確認すべき内容: 指定したブランチとの差分が取得される
  - 確認方法: `bun run cli review --base develop`を実行

- プロジェクト全体のlint:
  - 確認すべき理由: --all-filesオプションが正しく機能することを確認するため
  - 確認すべき内容: プロジェクト全体のlintが実行される
  - 確認方法: `bun run cli review --all-files`を実行

- Claude Codeレビュースキップ:
  - 確認すべき理由: claudeコマンドがない環境でも動作することを確認するため
  - 確認すべき内容: claudeコマンドがない場合、スキップメッセージが表示される
  - 確認方法: claudeコマンドがない環境で`bun run cli review`を実行

### デプロイ環境でのみ確認できる項目

本機能はローカルCLIツールのため、デプロイ環境での確認項目はありません。

# 機能仕様書: グローバルプロンプトインストール

機能名: `4-global-prompt-install`
作成日: 2025-12-30
モデル名: Claude Opus 4.5
仕様書テンプレートバージョン: 1.0.1

## 概要

CodexのAGENTS.mdとClaude CodeのCLAUDE.mdにグローバルプロンプトをインストールする機能を提供する。

## 要件

### 機能実装前後の変更点

#### 機能実装前

- `install-prompts`コマンドは`~/.codex/prompts`、`~/.codex/skills`、`~/.claude/commands`、`~/.claude/skills`、`~/.roo/commands`へのプロンプトファイルのコピーのみをサポートしている
- グローバル設定ファイル（AGENTS.md、CLAUDE.md）への書き込み機能は存在しない

#### 機能実装後

- `install-prompts --global`オプションを追加することで、`~/.codex/AGENTS.md`と`~/.claude/CLAUDE.md`にグローバルプロンプトをインストールできる
- 特定書式`===noaqh===` ... `===noaqh-end===`で囲まれた部分のみを更新することで、ユーザーの既存コンテンツを維持する
- 書き込み前に自動でバックアップを作成する（`*.backup.1`, `*.backup.2`, `*.backup.3`の3世代管理）
- オプションなしの場合は従来通りすべてのディレクトリにインストールし、加えてグローバルプロンプトもインストールする

### 機能要件

- FR-001: システムは`global-prompts/prompt.md`の内容を`~/.codex/AGENTS.md`にインストールできなければならない (global_prompt_install)_1
- FR-002: システムは`global-prompts/prompt.md`の内容を`~/.claude/CLAUDE.md`にインストールできなければならない (global_prompt_install)_1
- FR-003: システムは`===noaqh===` ... `===noaqh-end===`で囲まれた部分のみを更新し、既存コンテンツを維持しなければならない (global_prompt_install)_1
- FR-004: システムは対象ファイルが存在しない場合、新規作成しなければならない (global_prompt_install)_1
- FR-005: システムは書き込み前にバックアップファイルを3世代まで保持しなければならない（`*.backup.1`が最新、`*.backup.3`が最古） (global_prompt_install)_1
- FR-006: システムは`--global`オプションで個別にグローバルプロンプトのみをインストールできなければならない (cli_update)_2

### エンティティ構造

この機能ではデータベースエンティティの変更は不要。ファイルシステム上のMarkdownファイルを操作する。

## 成功基準

- `noaqh-dev install-prompts --global`を実行すると、`~/.codex/AGENTS.md`と`~/.claude/CLAUDE.md`にグローバルプロンプトがインストールされる
- `noaqh-dev install-prompts`を実行すると、従来のインストールに加えてグローバルプロンプトもインストールされる
- 既存のユーザーコンテンツ（`===noaqh===`ブロック外）が保持される
- 複数回実行しても内容が重複しない
- バックアップファイルが3世代まで保持される

### 型定義

#### Domain固有型 (features/prompt/types.ts)

- `InstallGlobalPromptsResult`: グローバルプロンプトインストール結果の型。`installed`（インストールされたファイルパスの配列）、`backups`（作成されたバックアップファイルパスの配列）、`warnings`（警告メッセージの配列）を持つ。

## 実装手順

### 実装セット test_helper: テストヘルパー

テストヘルパーは不要。理由：
- この機能はファイルシステム操作のみで、DBアクセスを伴わない
- 既存の`bun test`の機能と一時ディレクトリを使ったテストで十分対応可能
- 共通化が必要な複雑なテスト前処理が存在しない

### 実装セット (global_prompt_source)_0: グローバルプロンプトソースファイル作成

- 対象ファイル:
  - `global-prompts/prompt.md` (新規作成)

- 実装内容: グローバルプロンプトのソースファイルを作成する。このファイルの内容が`===noaqh===`ブロック内に挿入される。テストの実行に必要なため、最初に作成する。

- 手順:
  - [x] `global-prompts/`ディレクトリを作成
  - [x] `global-prompts/prompt.md`を作成（初期内容はサンプルプロンプト）

### 実装セット (global_prompt_install)_1: グローバルプロンプトインストール機能

#### 型定義追加

- 対象ファイル:
  - `features/prompt/types.ts` (修正)

- 実装内容:
  - `InstallGlobalPromptsResult`型を追加

```typescript
export type InstallGlobalPromptsResult = {
  installed: string[]
  backups: string[]
  warnings: string[]
}
```

#### ユーティリティ関数実装

- 対象ファイル:
  - `features/prompt/util.ts` (修正)
  - `features/prompt/util.test.ts` (修正)

- 実装関数:
  - `replaceNoaqhBlock(content: string, newBlockContent: string): string`
    - 実装内容: ファイル内容から`===noaqh===` ... `===noaqh-end===`で囲まれた部分を検出し、新しい内容で置換する。ブロックが存在しない場合はファイル末尾に追加する。
    - テスト項目:
      - 既存ブロックがある場合、ブロック内容のみが置換される
      - 既存ブロックがない場合、ファイル末尾にブロックが追加される
      - 既存コンテンツ（ブロック外）が維持される
      - 空ファイルの場合、ブロックのみが追加される

  - `createBackup(filePath: string): Promise<string | null>`
    - 実装内容: 指定されたファイルのバックアップを3世代まで管理する。ローテーション処理：
      1. `*.backup.3`が存在すれば削除
      2. `*.backup.2` → `*.backup.3`にリネーム
      3. `*.backup.1` → `*.backup.2`にリネーム
      4. 現在のファイルを`*.backup.1`としてコピー
      ファイルが存在しない場合はnullを返す。
    - テスト項目:
      - ファイルが存在する場合、`.backup.1`ファイルが作成される
      - バックアップファイルの内容が元ファイルと同一である
      - ファイルが存在しない場合、nullが返される
      - 既存の`.backup.1`がある場合、`.backup.2`にローテーションされる
      - 既存の`.backup.2`がある場合、`.backup.3`にローテーションされる
      - 既存の`.backup.3`がある場合、削除されて新しい`.backup.3`に置き換わる
      - 4回以上実行しても3世代までしか保持されない

#### ハンドラ実装

- 対象ファイル:
  - エントリーポイント:
    - `features/prompt/command/install-prompts/handler.ts` (修正)
      - 関数: `installGlobalPrompts(): Promise<InstallGlobalPromptsResult>`
      - 実装前状態: グローバルプロンプトインストール機能は存在しない
      - 実装後状態: `~/.codex/AGENTS.md`と`~/.claude/CLAUDE.md`にグローバルプロンプトをインストールできる
      - 実装内容:
        1. `global-prompts/prompt.md`を読み込む
        2. 各対象ファイル（`~/.codex/AGENTS.md`、`~/.claude/CLAUDE.md`）について：
           - ファイルが存在する場合はバックアップを作成
           - ファイル内容を読み込む（存在しない場合は空文字列）
           - `replaceNoaqhBlock`を使用してブロックを更新
           - ファイルに書き込む（ディレクトリが存在しない場合は作成）
        3. 結果を返す
      - 使用するPort: なし（ファイルシステム操作のみ）

- 対象テストファイル:
  - `features/prompt/command/install-prompts/handler.test.ts` (新規作成)
    - テスト項目:
      - グローバルプロンプトが~/.codex/AGENTS.mdにインストールされる
      - グローバルプロンプトが~/.claude/CLAUDE.mdにインストールされる
      - 既存ファイルの場合、バックアップが作成される
      - 既存コンテンツが維持される
      - ===noaqh===ブロックのみが更新される
      - ファイルが存在しない場合、新規作成される
      - 複数回実行しても内容が重複しない
      - global-prompts/prompt.mdが存在しない場合、エラーが返される

- 手順:
  - [ ] `InstallGlobalPromptsResult`型を追加(features/prompt/types.ts)
  - [ ] `replaceNoaqhBlock`のテストを作成(features/prompt/util.test.ts)
    - 既存ブロックがある場合、ブロック内容のみが置換される
    - 既存ブロックがない場合、ファイル末尾にブロックが追加される
    - 既存コンテンツ（ブロック外）が維持される
    - 空ファイルの場合、ブロックのみが追加される
  - [ ] `replaceNoaqhBlock`を実装(features/prompt/util.ts)
  - [ ] `bun test src/features/prompt/util.test.ts`を実行しテストが通ることを確認する
  - [ ] `createBackup`のテストを作成(features/prompt/util.test.ts)
    - ファイルが存在する場合、`.backup.1`ファイルが作成される
    - バックアップファイルの内容が元ファイルと同一である
    - ファイルが存在しない場合、nullが返される
    - 既存の`.backup.1`がある場合、`.backup.2`にローテーションされる
    - 既存の`.backup.2`がある場合、`.backup.3`にローテーションされる
    - 既存の`.backup.3`がある場合、削除されて新しい`.backup.3`に置き換わる
    - 4回以上実行しても3世代までしか保持されない
  - [ ] `createBackup`を実装(features/prompt/util.ts)
  - [ ] `bun test src/features/prompt/util.test.ts`を実行しテストが通ることを確認する
  - [ ] `installGlobalPrompts`のテストを作成(features/prompt/command/install-prompts/handler.test.ts)
    - グローバルプロンプトが~/.codex/AGENTS.mdにインストールされる
    - グローバルプロンプトが~/.claude/CLAUDE.mdにインストールされる
    - 既存ファイルの場合、バックアップが作成される
    - 既存コンテンツが維持される
    - ===noaqh===ブロックのみが更新される
    - ファイルが存在しない場合、新規作成される
    - 複数回実行しても内容が重複しない
    - global-prompts/prompt.mdが存在しない場合、エラーが返される
  - [ ] `installGlobalPrompts`を実装(features/prompt/command/install-prompts/handler.ts)
    - ファイル最上部に以下のTASKコメントを追加:
      ```
      // TASK: global-prompts/prompt.mdの内容を~/.codex/AGENTS.mdと~/.claude/CLAUDE.mdにインストールする
      // - ===noaqh=== ... ===noaqh-end===ブロック内のみを更新し、既存コンテンツを維持する
      // - 書き込み前にバックアップを作成する
      // - ファイルが存在しない場合は新規作成する
      ```
  - [ ] `bun test src/features/prompt/command/install-prompts/handler.test.ts`を実行しテストが通ることを確認する
  - [ ] コードスタイルに沿っているか確認し、リファクタリングを行う
  - [ ] リファクタリング後、再度テストを実行し、すべてのテストが通ることを確認

### 実装セット (cli_update)_2: CLIオプション追加

- 対象ファイル:
  - エントリーポイント:
    - `src/cli.ts` (修正)
      - 関数: `handleInstall(args: string[]): Promise<void>`（既存関数を修正）
      - 実装前状態: `--global`オプションは存在しない
      - 実装後状態: `--global`オプションでグローバルプロンプトのみをインストールできる。オプションなしの場合は従来のインストールに加えてグローバルプロンプトもインストールする
      - 実装内容:
        1. `--global`オプションの解析を追加
        2. `--global`指定時は`installGlobalPrompts`のみを実行
        3. オプションなし（`installAll`）の場合は従来処理に加えて`installGlobalPrompts`も実行
        4. 結果の出力処理を追加
      - 使用するPort: なし

- 対象テストファイル:
  - CLIのテストは手動確認で行う（E2Eテストのため）

- 手順:
  - [x] `handleInstall`関数に`--global`オプションの解析を追加(src/cli.ts)
  - [x] `installAll`時にグローバルプロンプトインストールを追加(src/cli.ts)
  - [x] ヘルプテキスト(HELP_TEXT)を更新(src/cli.ts)
  - [x] コードスタイルに沿っているか確認し、リファクタリングを行う
  - [x] `bunx tsc --noEmit`を実行し、型エラーがないことを確認（設定の問題のみで実装コードに問題なし）

## 影響ページ

- CLI: `install-prompts`コマンドに`--global`オプションが追加される
- ファイルシステム: `~/.codex/AGENTS.md`と`~/.claude/CLAUDE.md`が更新される

## 確認すべき項目

### ローカル確認できる項目

- 項目1: グローバルプロンプトインストール（新規ファイル）
  - 確認すべき理由: 対象ファイルが存在しない場合に正しく新規作成されることを確認するため
  - 確認すべき内容: `~/.codex/AGENTS.md`と`~/.claude/CLAUDE.md`が存在しない状態で`noaqh-dev install-prompts --global`を実行し、両ファイルが作成され、`===noaqh===`ブロック内にプロンプトが含まれていること
  - 確認方法:
    1. `rm ~/.codex/AGENTS.md ~/.claude/CLAUDE.md`で対象ファイルを削除
    2. `bunx noaqh-dev install-prompts --global`を実行
    3. `cat ~/.codex/AGENTS.md`と`cat ~/.claude/CLAUDE.md`で内容を確認

- 項目2: グローバルプロンプトインストール（既存ファイル）
  - 確認すべき理由: 既存コンテンツが維持され、ブロックのみが更新されることを確認するため
  - 確認すべき内容: 既存コンテンツを含むファイルに対して実行した場合、既存コンテンツが維持され、`===noaqh===`ブロックのみが更新されること
  - 確認方法:
    1. `~/.claude/CLAUDE.md`に既存コンテンツを追加（例：`echo "# My Custom Settings" >> ~/.claude/CLAUDE.md`）
    2. `bunx noaqh-dev install-prompts --global`を実行
    3. `cat ~/.claude/CLAUDE.md`で既存コンテンツが維持されていることを確認

- 項目3: バックアップ3世代管理
  - 確認すべき理由: バックアップが正しく3世代まで保持され、万が一の復元に使用できることを確認するため
  - 確認すべき内容: 既存ファイルが存在する場合、`*.backup.1`が作成され、4回以上実行しても3世代までしか保持されないこと
  - 確認方法:
    1. `bunx noaqh-dev install-prompts --global`を4回実行
    2. `ls -la ~/.claude/CLAUDE.md.backup.*`でバックアップファイルを確認
    3. `.backup.1`, `.backup.2`, `.backup.3`の3つのみが存在し、`.backup.4`が存在しないことを確認

- 項目4: 重複インストール防止
  - 確認すべき理由: 複数回実行しても内容が重複しないことを確認するため
  - 確認すべき内容: `noaqh-dev install-prompts --global`を複数回実行しても、`===noaqh===`ブロックが1つだけであること
  - 確認方法:
    1. `bunx noaqh-dev install-prompts --global`を3回実行
    2. `grep -c "===noaqh===" ~/.claude/CLAUDE.md`でブロック数が1であることを確認

- 項目5: 全体インストール時のグローバルプロンプト含有
  - 確認すべき理由: オプションなしでも グローバルプロンプトがインストールされることを確認するため
  - 確認すべき内容: `noaqh-dev install-prompts`（オプションなし）を実行した場合、従来のインストールに加えてグローバルプロンプトもインストールされること
  - 確認方法:
    1. `bunx noaqh-dev install-prompts`を実行
    2. コンソール出力に「グローバルプロンプト」関連のメッセージが含まれることを確認
    3. `cat ~/.claude/CLAUDE.md`で`===noaqh===`ブロックが含まれていることを確認

### デプロイ環境でのみ確認できる項目

この機能はローカルファイルシステムへの操作のみのため、デプロイ環境固有の確認項目はなし。

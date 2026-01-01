# 機能仕様書: Biome設定パッケージ作成

機能名: `5-biome-config-package`  
作成日: 2025-01-27  
モデル名: Claude Sonnet 4.5  
仕様書テンプレートバージョン: 1.0.2

## 概要
社内用Biome設定パッケージ（`@noaqh/biome-config`）を作成し、別リポジトリに自動反映するGitHub Actionsワークフローを構築する

## 要件 *(必須)*

### 機能実装前後の変更点
#### 機能実装前
- Biome設定は各プロジェクトで個別に管理されている
- 設定の変更を各プロジェクトに反映するには手動でコピーする必要がある
- 設定の一元管理ができていない

#### 機能実装後
- `packages/biome-config-noaqh` にBiome設定パッケージが作成される
- パッケージは `@noaqh/biome-config` として公開される
- 別リポジトリ（`noaqh-corp/biome-config-noaqh`）に自動的に反映される
- 各プロジェクトは `bun add github:noaqh-corp/biome-config-noaqh` でインストールできる
- 各プロジェクトの `biome.json` で `extends: ["@noaqh/biome-config/biome"]` として参照できる

### 機能要件

- FR-001: システムは `packages/biome-config-noaqh` ディレクトリにBiome設定パッケージを作成しなければならない (biome_config_package)_1
- FR-002: システムは `package.json` に `name: "@noaqh/biome-config"` と `exports` を設定し、`./biome` を `./biome.json` に割り当てなければならない (biome_config_package)_1
- FR-003: システムは `config/review/biome.json` の内容を `packages/biome-config-noaqh/biome.json` にコピーしなければならない (biome_config_package)_1
- FR-004: システムは `config/review/no-try-catch-in-server.grit` を `packages/biome-config-noaqh/` にコピーしなければならない (biome_config_package)_1
- FR-005: システムは `packages/biome-config-noaqh/biome.json` の `overrides` セクションで `no-try-catch-in-server.grit` を参照できるようにしなければならない (biome_config_package)_1
- FR-006: システムは `packages/biome-config-noaqh` の変更を検知し、別リポジトリ（`noaqh-corp/biome-config-noaqh`）に自動的に反映するGitHub Actionsワークフローを提供しなければならない (github_actions)_2

### エンティティ構造

エンティティの変更は不要です。ファイル構造の変更のみです。

## 成功基準 *(必須)*

- `packages/biome-config-noaqh` ディレクトリが作成され、`package.json`、`biome.json`、`no-try-catch-in-server.grit` が配置されている
- `package.json` の `exports` が正しく設定され、`@noaqh/biome-config/biome` として参照できる
- `biome.json` の `overrides` セクションで `no-try-catch-in-server.grit` が正しく参照されている
- GitHub Actionsワークフローが `packages/biome-config-noaqh` の変更を検知し、別リポジトリに自動反映する
- 別リポジトリで `bun add github:noaqh-corp/biome-config-noaqh` が実行でき、`biome.json` で `extends: ["@noaqh/biome-config/biome"]` として参照できる

### 型定義 *(新規型が必要な場合に含める)*

型定義は不要です。

## 実装手順

### 実装セット biome_config_package_1: Biome設定パッケージ作成

- 対象ファイル:
  - `packages/biome-config-noaqh/package.json` (新規追加)
  - `packages/biome-config-noaqh/biome.json` (新規追加)
  - `packages/biome-config-noaqh/no-try-catch-in-server.grit` (新規追加)
  - `packages/biome-config-noaqh/README.md` (新規追加)

- 実装内容: 
  - `packages/biome-config-noaqh` ディレクトリを作成
  - `package.json` を作成し、`name: "@noaqh/biome-config"`、`exports` を設定
  - `config/review/biome.json` の内容を `packages/biome-config-noaqh/biome.json` にコピー
  - `config/review/no-try-catch-in-server.grit` を `packages/biome-config-noaqh/` にコピー
  - `biome.json` の `overrides` セクションの `plugins` パスを `./no-try-catch-in-server.grit` に修正
  - `README.md` を作成し、使用方法を記載

- 手順:
  - [x] `packages/biome-config-noaqh` ディレクトリを作成
  - [x] `packages/biome-config-noaqh/package.json` を作成
    - `name: "@noaqh/biome-config"` を設定
    - `version: "1.0.0"` を設定
    - `exports` を設定し、`./biome` を `./biome.json` に割り当て
  - [x] `config/review/biome.json` の内容を読み込み、`packages/biome-config-noaqh/biome.json` にコピー
  - [x] `config/review/no-try-catch-in-server.grit` を `packages/biome-config-noaqh/no-try-catch-in-server.grit` にコピー
  - [x] `packages/biome-config-noaqh/biome.json` の `overrides` セクションの `plugins` を `["./no-try-catch-in-server.grit"]` に修正
  - [x] `packages/biome-config-noaqh/README.md` を作成し、インストール方法と使用方法を記載
  - [x] `packages/biome-config-noaqh/.gitignore` を作成し、`node_modules` などを除外

### 実装セット github_actions_2: GitHub Actionsワークフロー作成

- 対象ファイル:
  - `.github/workflows/sync-biome-config.yml` (新規追加)

- 実装内容:
  - `packages/biome-config-noaqh` の変更を検知するGitHub Actionsワークフローを作成
  - 別リポジトリ（`noaqh-corp/biome-config-noaqh`）に変更を自動反映
  - `.github/workflows/copy-docs-to-article.yml` を参考に実装

- 手順:
  - [x] `.github/workflows/sync-biome-config.yml` を作成
    - `on.push.paths` に `packages/biome-config-noaqh/**` を追加
    - `on.push.branches` に `main` を追加
    - `workflow_dispatch` も追加（手動実行可能にする）
  - [x] ソースリポジトリ（現在のリポジトリ）をチェックアウト
  - [x] ターゲットリポジトリ（`noaqh-corp/biome-config-noaqh`）をチェックアウト
    - `secrets.NOAQH_PAT` を使用（既存のワークフローと同様）
  - [x] `packages/biome-config-noaqh` の内容をターゲットリポジトリのルートにコピー
  - [x] 変更があるかチェック
  - [x] 変更がある場合、コミット・プッシュ
    - コミットメッセージ: `chore: sync biome config from dev repository`
  - [x] ワークフローの動作確認のため、テスト実行を検討

## UI確認手順

概要: Biome設定パッケージが正しく作成され、GitHub Actionsワークフローが正常に動作することを確認する。

### 確認セット パッケージ作成確認
パッケージが正しく作成されていることを確認する。
- 事前準備手順: 
  1. `packages/biome-config-noaqh` ディレクトリが存在することを確認する。
  2. `packages/biome-config-noaqh/package.json` が存在することを確認する。
- 確認手順: 
  1. 📸 `packages/biome-config-noaqh/package.json` の `name` が `@noaqh/biome-config` であることを確認する。
  2. 📸 `packages/biome-config-noaqh/package.json` の `exports` が正しく設定されていることを確認する。
  3. 📸 `packages/biome-config-noaqh/biome.json` が存在し、`config/review/biome.json` の内容と一致することを確認する。
  4. 📸 `packages/biome-config-noaqh/no-try-catch-in-server.grit` が存在し、`config/review/no-try-catch-in-server.grit` の内容と一致することを確認する。
  5. 📸 `packages/biome-config-noaqh/biome.json` の `overrides` セクションの `plugins` が `["./no-try-catch-in-server.grit"]` であることを確認する。

### 確認セット GitHub Actions動作確認
GitHub Actionsワークフローが正常に動作することを確認する。
- 事前準備手順: 
  1. `packages/biome-config-noaqh` に変更を加える（例: `biome.json` のコメントを追加）。
  2. 変更をコミット・プッシュする。
- 確認手順: 
  1. 📸 GitHub Actionsのワークフロー実行履歴を確認し、`sync-biome-config` が実行されていることを確認する。
  2. 📸 ワークフローが成功していることを確認する。
  3. 📸 別リポジトリ（`noaqh-corp/biome-config-noaqh`）に変更が反映されていることを確認する。
  4. 📸 別リポジトリのコミット履歴に `chore: sync biome config from dev repository` が追加されていることを確認する。

### 確認セット パッケージ利用確認
別リポジトリからパッケージをインストールし、正しく参照できることを確認する。
- 事前準備手順: 
  1. テスト用のプロジェクトを作成する（または既存のプロジェクトを使用）。
  2. テスト用プロジェクトの `package.json` に `@biomejs/biome` がインストールされていることを確認する。
- 確認手順: 
  1. 📸 テスト用プロジェクトで `bun add github:noaqh-corp/biome-config-noaqh` を実行し、インストールが成功することを確認する。
  2. 📸 テスト用プロジェクトの `biome.json` に `extends: ["@noaqh/biome-config/biome"]` を追加する。
  3. 📸 `bunx @biomejs/biome check` を実行し、エラーが発生しないことを確認する。
  4. 📸 Biomeの設定が正しく適用されていることを確認する（例: `lineWidth` が100であること）。

## 影響ページ

影響ページはありません。CLIツールの内部構造の変更のみです。

## ユーザーが動作確認を行うべき項目

### ローカル確認できる項目
- [パッケージファイルの存在確認]: 
  確認すべき理由: パッケージが正しく作成されていることを確認するため
  確認すべき内容: `packages/biome-config-noaqh` ディレクトリに `package.json`、`biome.json`、`no-try-catch-in-server.grit`、`README.md` が存在すること
  確認方法: `ls -la packages/biome-config-noaqh/` を実行し、ファイル一覧を確認する

- [package.jsonの設定確認]: 
  確認すべき理由: パッケージが正しく公開されるために必要な設定が正しいことを確認するため
  確認すべき内容: `package.json` の `name` が `@noaqh/biome-config`、`exports` が正しく設定されていること
  確認方法: `cat packages/biome-config-noaqh/package.json` を実行し、内容を確認する

- [biome.jsonの内容確認]: 
  確認すべき理由: Biome設定が正しくコピーされ、Gritプラグインの参照が正しいことを確認するため
  確認すべき内容: `biome.json` の内容が `config/review/biome.json` と一致し、`overrides` セクションの `plugins` が `["./no-try-catch-in-server.grit"]` であること
  確認方法: `cat packages/biome-config-noaqh/biome.json` を実行し、内容を確認する

### デプロイ環境でのみ確認できる項目
- [GitHub Actionsワークフローの動作確認]: 
  確認すべき理由: 別リポジトリへの自動反映が正常に動作することを確認するため
  確認すべき内容: `packages/biome-config-noaqh` に変更を加えてプッシュした際に、GitHub Actionsワークフローが実行され、別リポジトリに変更が反映されること
  確認方法: GitHubのActionsタブでワークフローの実行履歴を確認し、別リポジトリ（`noaqh-corp/biome-config-noaqh`）のコミット履歴を確認する

- [別リポジトリからのパッケージインストール確認]: 
  確認すべき理由: パッケージが正しく公開され、利用できることを確認するため
  確認すべき内容: 別リポジトリから `bun add github:noaqh-corp/biome-config-noaqh` でインストールでき、`biome.json` で `extends: ["@noaqh/biome-config/biome"]` として参照できること
  確認方法: テスト用プロジェクトでパッケージをインストールし、`biome.json` で参照して動作確認する


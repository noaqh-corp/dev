# @noaqh/biome-config

社内用Biome設定パッケージです。

## インストール

### 最新版をインストール

```bash
bun add github:noaqh-corp/biome-config-noaqh
```

### 特定のバージョンをインストール

```bash
bun add github:noaqh-corp/biome-config-noaqh#v1.0.1
```

## 使用方法

プロジェクトの `biome.json` で以下のように設定してください:

```json
{
  "extends": ["@noaqh/biome-config/biome"]
}
```

## バージョン管理

このパッケージは[セマンティックバージョニング](https://semver.org/)に従ってバージョン管理されています。

- **PATCH** (1.0.0 → 1.0.1): 設定ファイルやドキュメントの変更
- **MINOR** (1.0.0 → 1.1.0): `package.json`の`exports`の変更
- **MAJOR** (1.0.0 → 2.0.0): 破壊的変更（通常は発生しません）

各リリースにはGitタグとGitHub Releaseが作成されます。

## 含まれる設定

- Biomeの推奨ルール
- カスタムルール（`no-try-catch-in-server.grit`）
- フォーマッター設定


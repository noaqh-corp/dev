# @noaqh/biome-config

社内用Biome設定パッケージです。

## インストール

```bash
bun add github:noaqh-corp/biome-config-noaqh
```

## 使用方法

プロジェクトの `biome.json` で以下のように設定してください:

```json
{
  "extends": ["@noaqh/biome-config/biome"]
}
```

## 含まれる設定

- Biomeの推奨ルール
- カスタムルール（`no-try-catch-in-server.grit`）
- フォーマッター設定


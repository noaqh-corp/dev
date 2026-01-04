# プロジェクトのセットアップ方法

このドキュメントはバニラプロジェクトから開発を始めるときに必要な手順を記載しています。

---

## 0. AIエージェント設定ファイル
CLAUDE.md,AGENTS.mdにAIエージェントへの指示が記載されているべき

## 1. 開発サーバーの起動・停止

### `bun run dev` ですべて起動する
- bun run devでscripts/dev.shが実行されるようになっている
- 別途 `docker compose` などの起動をする必要がなく、bun run devですべて起動できるようになっている
- ログ表示+logs/へ適切にログが出力されるようになっている
- セットアップコマンドは一撃で起動し、マイグレーション・シード・テストデータ投入が完了する
- 特定のポート以外で起動しないようになっている
特に設定されていない場合は(5000~5099)をランダムで割り当てる。ポートを決めたら以下のようにエージェント設定ファイルに記載する。

```
## アクセス情報
localhost:{ポート番号}

```

### `bun run kill` ですべて停止する
- docker compose なども含めてすべてのプロセスを停止する

### `bun run reset:all` でDBリセット + 再初期化を行う
- 開発中のDB状態をクリーンにリセットできるようにする
- その後に `bun run dev` が必要なことを echo で表示する

### `bun run dev:tunnel` でトンネルと開発環境を両方起動する
- 外部からのアクセスが必要なプロジェクト向け
- pinggy を利用する

### scripts を増やしすぎない
- `bun run db:init` や `bun run db:generate` などは不要
- `bun run dev` で一撃で起動できていれば十分

---

## 2. ログ管理

### ログは `logs/` に出力する
- SvelteKit のログは `logs/web.log` に出力される
- Mailhogのログは `logs/mailhog.log` に出力される
- 同様に他のサービスのログも適切に出力されるようになっている
エージェント設定ファイルには以下のように記載する。
```
## ログ
SvelteKitのログは `logs/web.log` に出力される
Mailhogのログは `logs/mailhog.log` に出力される
{他のサービスのログについても記載}
```




### Ctrl+C で全プロセスを安全に終了できるようにする
- `dev.sh` 内で trap を設定し、graceful shutdown を実現する

### ログのフォーマット

ログの表記は以下のようにする。
```
[2026-01-04 10:00:00] [web] ログメッセージ
[2026-01-04 10:00:00] [mailhog] ログメッセージ

```

フォアグラウンドでは色わけも行うが、ログファイルでは色わけは行わない。

### bun run dev実行時にログファイルをクリアする

bun run dev実行時にログファイルをクリアする。

---

## 3. データベース

### PostgreSQL を Docker Compose で起動する
- ローカル開発環境では Docker Compose で管理
- ホストへのバインド5400~5499をランダムで割り当てる(下2桁はwebと同じにする)

### マイグレーションファイルの作成は必ずbunx prisma ~~~を使う
sqlファイルを絶対に直接編集しない。


### scripts/seed.tsを用意し、dev.shで実行されるようにする
シードデータを追加する。デプロイ環境でも実行されるべき処理。


### scripts/add-sample-data.tsを用意し、dev.shで実行されるようにする
動作確認に便利なサンプルデータを追加する。目的はテストデータをあらかじめDBに入れておくことで楽にテストを行えるようにすること。デプロイ環境では実行しない。


---

## 4. 外部サービス
### ホストへフォーワードするポートは下2桁はwebと同じにする
- mailhog,minio以外も同様

### メールは Mailhog を使用する
- ローカル開発でのメール送信テスト用
- SMTPホストへのバインド5300~5399をランダムで割り当てる(下2桁はwebと同じにする)
- WEBUIへのバインド5200~5299をランダムで割り当てる(下2桁はwebと同じにする)

### S3 互換ストレージ（MinIO）を docker-compose に含める
- ファイルアップロード機能のローカル開発に利用
- ヘルスチェックを設定し、init 処理で依存関係を管理する
- 初期バケット作成を自動化する
- ホストへのバインド5500~5599をランダムで割り当てる(下2桁はwebと同じにする)


### Sentry はセットアップするがローカル環境では使用しない
- 本番・ステージング環境向けの設定のみ

---

## 5. 認証・デバッグ

### デバッグログインを実装する
- 特定アカウントのログインを一発で行えるようにする
- また、ログイン方法もdocs/browser-knowledge.mdに記載する

---

## 6. ドキュメント

### ログの扱いを `AGENTS.md`・`CLAUDE.md` に記載する
- AI エージェントがログを適切に扱えるようにする

### `docs/browser-knowledge.md` にブラウザ操作についての知識を記載する
- ログイン方法などを記載

### `.env.example` を用意する
- 必要な環境変数をドキュメント化
- 新規参加者のセットアップを容易にする

---

## 7. Git 設定

### `.gitignore` に含めるもの
- `spec/` ディレクトリ
- `logs/`、`dev.log`、`tunnel.log`

### pre-commit でフォーマットを行う
- lint-staged を利用し、ステージングされたファイルのみにフォーマットを適用する

## 8. Lint/Format

### LintはOxlintを利用する
https://github.com/noaqh-corp/noaqh-lint

### Formatはprettierを利用する

---

## 9. 環境変数
環境変数は最小限に

MODEという環境変数を用意し以下のように設定する。

local: ローカル開発環境
development: テスト用デプロイ環境
production: 本番環境

ENABLE_~~~という環境変数は個別に用意しない

--- 

### デバッグログイン
# Better Auth + SvelteKit デバッグログイン実装ガイド

開発環境でLINE認証などをバイパスし、任意のユーザーとしてログインできる機能。

## 概要

- `/debug/login?email=xxx` でログイン
- `/debug/logout` でログアウト
- Cookieベースで永続化（7日間）
- 開発環境（`dev === true`）のみ有効

## 実装手順

### 1. hooks.server.ts に追加

```typescript
import { dev } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// デバッグログイン用Cookie名
const DEBUG_LOGIN_COOKIE = 'debug_login_email';

/**
 * 開発環境用デバッグログイン機能
 */
const handleDebugLogin: Handle = async ({ event, resolve }) => {
    // 開発環境のみ有効
    if (!dev) {
        return resolve(event);
    }

    const url = new URL(event.request.url);

    // /debug/logout でデバッグログインを解除
    if (url.pathname === '/debug/logout') {
        event.cookies.delete(DEBUG_LOGIN_COOKIE, { path: '/' });
        throw redirect(302, '/');
    }

    // /debug/login?email=xxx でデバッグログインを設定
    if (url.pathname === '/debug/login' && url.searchParams.has('email')) {
        const email = url.searchParams.get('email')!;

        // ユーザーを検索（プロジェクトに合わせて実装）
        const user = await findUserByEmail(email);

        if (user) {
            event.cookies.set(DEBUG_LOGIN_COOKIE, email, {
                path: '/',
                httpOnly: true,
                secure: false, // 開発環境なのでfalse
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7日
            });
            const redirectTo = url.searchParams.get('redirectTo') ?? '/';
            throw redirect(302, redirectTo);
        }
        throw redirect(302, '/?debug_error=user_not_found');
    }

    // デバッグログインCookieがあれば、locals.authを上書き
    const debugEmail = event.cookies.get(DEBUG_LOGIN_COOKIE);
    if (debugEmail) {
        const user = await findUserByEmail(debugEmail);

        if (user) {
            // locals.authを上書きして、このユーザーとしてログイン状態を返す
            event.locals.auth = async () => ({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    // ... 他のユーザーフィールド
                },
                session: {
                    id: `debug-session-${user.id}`,
                    token: `debug-token-${user.id}`,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ipAddress: null,
                    userAgent: null,
                },
            });
        } else {
            // ユーザーが削除された場合はCookieをクリア
            event.cookies.delete(DEBUG_LOGIN_COOKIE, { path: '/' });
        }
    }

    return resolve(event);
};
```

### 2. sequence に追加

**重要**: `betterAuthHandle` の**後**に配置する（`betterAuthHandle` が `event.locals.auth` を設定するため、その後で上書きする必要がある）

```typescript
export const handle = sequence(
    betterAuthHandle,
    handleDebugLogin,  // betterAuthHandleの後に配置
    // 他のハンドラー...
);
```

### 3. ユーザー検索関数

プロジェクトに合わせて実装：

```typescript
// 例: Prisma を使う場合
async function findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
}

// 例: Repository パターンを使う場合
async function findUserByEmail(email: string) {
    const userRepository = Container.getUserRepository();
    const users = await userRepository.search({ email });
    return users[0] ?? null;
}
```

### 4. ユーザーフィールドの調整

`event.locals.auth` で返すユーザーオブジェクトは、プロジェクトの User 型に合わせる：

```typescript
event.locals.auth = async () => ({
    user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
        // プロジェクト固有のフィールドを追加
    },
    session: {
        id: `debug-session-${user.id}`,
        token: `debug-token-${user.id}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
    },
});
```

## 使い方

```bash
# ログイン
/debug/login?email=test@example.com

# リダイレクト先を指定
/debug/login?email=test@example.com&redirectTo=/admin

# ログアウト
/debug/logout
```

## 制限事項

- **開発環境のみ有効** - `dev` が `false` の場合は何もせずスルー
- **SvelteKit サーバーサイドのみ有効** - `+page.server.ts`、`+layout.server.ts`、hooks 内で `event.locals.auth()` を呼ぶ場合に有効
- **Better Auth API は非対応** - `/api/auth/get-session` などの Better Auth API は正規のセッションCookieを参照するため `null` を返す

## セキュリティ

- `dev` フラグのチェックにより本番環境では無効
- Cookie は `httpOnly` で設定されるため、JavaScript からアクセス不可
- 必要に応じて追加の環境変数チェックを入れることも可能：

```typescript
const DEBUG_LOGIN_ENABLED = MODE === 'local';

if (!dev || !DEBUG_LOGIN_ENABLED) {
    return resolve(event);
}
```

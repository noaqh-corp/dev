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
const DEBUG_LOGIN_ENABLED = process.env.DEBUG_LOGIN_ENABLED === 'true';

if (!dev || !DEBUG_LOGIN_ENABLED) {
    return resolve(event);
}
```

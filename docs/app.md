# アプリ実装ガイド
version: 1.0.0
date: 2025-10-18

変更履歴:
- 2025-10-18: 初版

## 1. 目的と背景

このドキュメントは、アプリケーションの実装ガイドです。

## 2. 基本方針

- 不要な抽象化を入れずシンプルに実装する
- 謙虚に思考し、行動する
- ファイル数は少なくする。新しくファイルを作る際は慎重に考える
- 不要な関数は作らない
- ソースコードの行数は可能な限り少なくする

## 3. 処理の共通化について

- 複数箇所で使われることが確定するまで共通化は行わない

## 4. エラー処理について

- try catch文は基本的に使わない。Errorがthrowされて500エラーが返ることは基本的に問題ない
- ただし、エラー時に別の特別な処理を続行したい場合や、ループ処理を終了させたくないなど特殊な場合はtry catch文を使って良い
- try catchでエラーを握りつぶすのは最低の実装である。エラーが発生しストップすることは問題を認識するために非常に重要
- 例外を握りつぶさない。`try/catch` ではログと再throw・リトライ等の方針を明確化
- 過度なフォールバック（`?? ""`, `?? 0`）で失敗を隠さない

## 5. 型について

- anyは基本的に使わない
- できるだけ新しく作らない。どうしても作る必要がある場合は既存の型(Prismaの型など)を拡張する
- プロパティがnullableな型は極力作らない
- `any` 禁止。必要に応じて `unknown` + ナロイング、または Zod で検証
- Nullable/Optional 引数は避け、呼び出し元で事前検証する
- デフォルト引数は使用しない。呼び出し時に明示的に渡す

## 6. 実装について

- デフォルトがNoneな引数を受け取る関数は作らない
- 実装にテストを通すために特殊な処理を入れない
- 環境変数が存在しない場合にthrowしたり、必須引数のundefinedチェックは不要。シンプルに実装する
- テストのモック化は行わないが、日時に関わるもののみ可能
- テストは必要最小限にする。エラーの確認は基本的にしない
- HappyPathテストのシナリオとassertを充実させることで正常動作を確認する
- 重複ロジックは `routes/`・`shared/`・`types/` へ抽出。判断がつかない場合は相談
- 同じ条件判定を複数回書かない（意図的であればコメント）
- 不要な `as` や冗長な null チェックを避ける

## 7. コード構造

- テストは仕様のドキュメントとして扱う。命名で振る舞いが分かるように
- `src/lib/server/test/scenarios/**` の各ケース直前に `// flow:` コメントを記述
- カバレッジ目安は 80% 程度。CICD で `bun run test` を必ず実行

## 8. 認証・セッション・デバッグログイン

### 8.1 ベースライン

- 利用可能ライブラリ: **Auth.js** (SvelteKit adapter) または **Better Auth**
- `src/lib/server/auth.ts` で `createAuth()` 相当の初期化を行い、以下を提供する:
  - `handle` フックのラッパー (`handleAuth`) を hooks.server.ts に統合
  - `requireAuth`, `requireAdmin`, `currentUser` などのヘルパー
  - セッションストレージは Prisma Adapter を推奨
- サインイン戦略: Email/Password + OAuth など、プロジェクト要件に応じて Auth.js / Better Auth の Provider を設定

### 8.2 デバッグログイン仕様

開発時の迅速な検証のため、デバッグログインを標準化する。

| 項目 | 内容 |
| :---- | :---- |
| エンドポイント | `GET /debug/login` |
| クエリ | `email` (必須), `redirect_to` (任意、URL エンコード。デフォルト `/`) |
| 実装概要 | 1) `requireNonProduction()` で `NODE_ENV !== "production"` を担保。2) 指定メールのユーザーを Auth.js/Better Auth のアダプタ経由で取得。3) セッションを発行し、`setSession` or `createSession` で Cookie を設定。4) `redirect_to` が安全なパスか検証してからリダイレクト。 |
| セキュリティ | - 本番では常に 404 を返す。<br>- 存在しないメール指定時は 400 を返しログに記録。<br>- 利用したメールアドレスとアクセス元 IP を `dev.log` に残す。 |
| 例 | `http://localhost:5005/debug/login?email=admin@example.com&redirect_to=%2Fadmin` |

**サンプル実装（擬似コード）**

```ts
// src/routes/debug/login/+server.ts
import { createAuth } from "$lib/server/auth"
import { redirect, error } from "@sveltejs/kit"

export const GET = async ({ url, locals }) => {
  if (locals.runtime.env === "production") throw error(404)

  const email = url.searchParams.get("email")
  if (!email) throw error(400, "email is required")

  const redirectTo = url.searchParams.get("redirect_to") ?? "/"
  if (!redirectTo.startsWith("/"))
    throw error(400, "redirect_to must be a relative path")

  const auth = createAuth()
  const user = await auth.adapters.user.findByEmail(email)
  if (!user) throw error(400, "user not found")

  await auth.session.create(locals, { userId: user.id })
  return redirect(302, redirectTo)
}
```

### 8.3 デバッグログインの運用

- 仕様は §8.2 を参照
- 利用履歴を `dev.log` に残し、Sentry にも送信できるよう logger を呼び出す

## 9. 観測性とデバッグ

### 9.1 Sentry

- `hooks.client.ts` / `hooks.server.ts` で初期化
- `src/lib/server/util/logger.ts` から Sentry へログ転送
- `scripts/sentry-log-test.ts` で手動検証可能

### 9.2 ログ

- アプリ: `dev.log`
- 定期実行: `cron.log`
- エラーは必ずスタックトレース付きで出力

### 9.3 デタッチ起動

```shell
# scripts/dev-detach.sh
#!/usr/bin/env bash
set -eu
bun run dev >dev.log 2>&1 &
echo $! > .dev.pid
```

停止時は `bun run kill` または `kill $(cat .dev.pid)`

## 10. 実装パターン

### 10.1 共有サーバーアクション

```ts
// src/lib/server/routes/deliveries/manualSendSelectedAction.ts
import { Container } from "$lib/server/shared/container"

export async function load(event) {
  const repo = Container.getDraftDocumentRepository()
  // フィルタ条件を event から構築して返却
  return { items: await repo.findPending(/* ... */) }
}

export const action = async (event) => {
  const flow = await import(
    "$lib/server/flows/document-package-process/handler"
  )
  await flow.sendSelected(event)
  return { success: true }
}
```

### 10.2 管理ルートでの Prisma 使用

```ts
// src/routes/admin/users/+page.server.ts
import { prisma } from "$lib/server/prisma"

export const load = async ({ locals }) => {
  if (!locals.session?.isAdmin) throw new Error("admin only")
  return {
    users: await prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  }
}
```

### 10.3 Feature command

```ts
// src/lib/server/features/delivery/command/send-document/handler.ts
import { Container } from "$lib/server/shared/container"
import type { SendDocumentInput } from "$lib/server/types/sendDocument"

export async function sendDocument(input: SendDocumentInput) {
  const repo = Container.getDraftDocumentRepository()
  const draft = await repo.findDraft(input.draftId)
  if (!draft) throw new Error("Draft not found")
  return repo.markAsSent(draft, input)
}
```

### 10.4 Flow

```ts
// src/lib/server/flows/reminder/handler.ts
import { fetchPendingDeliveries } from "$lib/server/features/delivery/query/fetch-pending/handler"
import { sendReminder } from "$lib/server/features/contact/command/send-reminder/handler"

export async function executeMonthlyReminder() {
  const deliveries = await fetchPendingDeliveries()
  await Promise.all(deliveries.map((item) => sendReminder(item)))
}
```

### 10.5 API ルート

```ts
// src/routes/api/lineworks/callback/+server.ts
import type { RequestHandler } from "./$types"
import { Container } from "$lib/server/shared/container"

export const POST: RequestHandler = async ({ request }) => {
  const service = Container.getLineWorksService()
  const payload = await request.json()
  await service.handleWebhook(payload)
  return new Response("ok", { status: 200 })
}
```

## 11. 運用コマンド

| コマンド | 用途 |
| :---- | :---- |
| `bun run dev` | Docker サービスと開発サーバーをデタッチ起動 |
| `bun run kill` | 開発サーバー停止 |
| `bun run build` / `bun run preview` | 本番ビルドとプレビュー |
| `bun run check` | Svelte ファイル型チェック |
| `bun run test` / `bun run test:unit` | テスト実行 |
| `bun run db:generate` | ZenStack → Prisma スキーマ生成 |
| `bun run db:reset` | DB リセット・マイグレーション適用 |
| `bun run db:seed` | 初期データ投入 |
| `bun tsc --noEmit <file>` | 任意ファイルの型検証 |

## 12. 実装手順（TDDベース）

### 12.1 テスト実装

- Red フェーズで仕様をテストとして表現する。テスト名に振る舞いを直書きし、前提→操作→期待値を分ける
- コンパイルエラーを恐れず、理想の API 形状をテストでデザインする。曖昧な要件はこのタイミングでプロダクトオーナーに確認する
- ベビーステップを徹底し、一度に 1 つの主張だけをチェックする。テストを追加するたびに直ちに実行し、既存テストがグリーンであることを確認してから次に進む

### 12.2 実装

- Green フェーズではテストを通すことだけに集中し、最小限のコードで期待動作を満たす。必要ならハードコードや暫定分岐も許容する
- ZenStack の型や既存ユーティリティを活用し、不要な型宣言や抽象化を避ける。Mock を常用しない方針を忘れず、本番コードをそのまま使う
- 例外やエッジケースはテストで裏付けが取れてから追加し、YAGNI（先取り実装しない）を徹底する

### 12.3 リファクタリング

- Refactor フェーズで重複排除・命名整理・責務分割を行う。テストコードも対象に、可読性と仕様説明力を高める
- ZenStack 生成型や共有ロジックへ寄せ、`types/` へ新規型を追加する場合は多重利用が確定しているか見極める。常に「テストが保護網になっているか」を確認する
- 振る舞いを変える変更はこの段階では禁止。テストが常にグリーンであることを確認しながら小さく進める

## 13. 設計手順

### 13.1 UI をモックで作成

- 画面遷移と主要 UI コンポーネントをsrc/routes/mock/** にモック化し、ユーザー（プロダクトオーナー）のレビューを必ず受ける

### 13.2 テーブル設計

- モデル・リレーション・インデックスを `schema.zmodel` のドラフトで設計する。正規化と性能を意識し、履歴テーブルや外部キー制約を明示
- 設計後はユーザーとレビューし、ビジネスルールとの齟齬がないかを確認。承認を得てから ZenStack へコミットする

### 13.3 型整理

- ZenStack 生成型で賄えないものを最小限洗い出し、`types/` に置く候補をメモ。不要な型を増やさないよう、利用箇所が複数存在するか必ず検証する
- 型追加案は開発チームでレビューし、既存の Zod スキーマで代替できないかを議論する

### 13.4 flow / command / query 設計

- 各ユースケースで必要な入力・出力・副作用・エラーを文章化。sequence diagram などで結合順を整理する
- 設計ドキュメント（Issue や PR テンプレート）に記載し、ユーザー／開発チームのレビューを受けてから実装に進む

### 13.5 各フロー実装

- 決定した設計に基づき、TDD のステップで command → query → flow の順に実装。ZenStack 生成型・既存ユーティリティを最大限利用する
- 実装後はユーザーに振る舞いをデモし、追加要望や仕様差異があれば再度設計ステップへ戻る

## 14. レビュー観点

- 上記原則に加え、`any` 有無、無駄な抽象化、Null の扱い、例外処理、DRY を重点的に確認
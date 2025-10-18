## 0\. 目的と背景

このドキュメントは、SvelteKit \+ TypeScript (strict) を用いたバニラプロジェクトにおいて、アーキテクチャの意図・ディレクトリ構造・開発プロセス・運用フローを共有します。

---

## 1\. 設計の意図

## 2\. 設計コンセプト

1. 最小限のレイヤー: `command/`・`query/` を基本単位とする。  
2. ZenStack ファースト: 型・スキーマは ZenStack 生成物を中心に扱い、手書きの型は多重利用ケースのみ。  
3. TDDによる漸進実装: ユースケース単位で Red-Green-Refactor を回し、早期に仕様をテスト化。  
4. 観測とデバッグを組み込み: Sentry・デバッグログイン・デタッチ起動など、運用上必須の仕組みを初期から導入。  
5. モックは例外手段: 実装・テストは基本的に本番と同じコードパスを使用し、Mock は意図が明確な場合に限定。

---

## 3\. ディレクトリ構造

```
.
├── src/
│   ├── lib/
│   │   ├── generated/            # ZenStack 自動生成（編集不可）
│   │   ├── hooks/                # クライアント共通フック
│   │   ├── util/                 # フロントユーティリティ
│   │   └── server/
│   │       ├── adapter/
│   │       │   ├── repository/   # Prisma 実装と mock/
│   │       │   └── service/      # 外部サービス実装と mock/
│   │       ├── features/         # ドメインユースケース (command/query 中心)
│   │       ├── flows/            # 複数ユースケースのオーケストレーション
│   │       ├── providers/        # SDK・Sentry などの初期化
│   │       ├── routes/           # 共有サーバーアクション
│   │       ├── shared/           # DI コンテナ・port・共通定数
│   │       ├── entrypoint/       # cron.ts / cli.ts 等
│   │       ├── test/             # サーバーサイドテスト（flow コメント必須）
│   │       ├── types/            # 複数箇所で使う手書き型
│   │       └── util(s)/          # サーバーユーティリティ（logger 等）
│   └── routes/
│       ├── admin/                # 管理 UI (Prisma 直接利用を許可)
│       ├── (public)/, contact/, ...
│       ├── api/                  # Webhook・外部 API
│       ├── debug/                # デバッグルート
│       └── +layout/+page.*       # SvelteKit 標準構成
├── scripts/                      # seed や運用スクリプト
├── prisma/                       # ZenStack が生成する schema.prisma 等
├── dev.log / cron.log            # ログ出力先
└── 設計.md                       # 本ドキュメント
```

**主要ディレクトリの役割**

| ディレクトリ | 役割 | ポイント |
| :---- | :---- | :---- |
| `features/<Domain>` | ユースケース単位の command/query | まずここから設計を始める。`core/` は作らない。 |
| `flows/<Flow>` | 複数ユースケースの組み合わせ | 状態遷移や通知など横断処理を集約。 |
| `routes/` (server) | 共有アクション | 複数ページで同一ロジックを使うときに抽出。 |
| `shared/port` | 抽象インターフェース | Adapter 実装の契約を定義。 |
| `adapter/*/mock/` | テスト用 Mock | 原則テスト専用。常用しない。 |
| `types/` | 手書きの共有型 | ZenStack で賄えない複数箇所共有型のみ配置。 |
| `generated/` | ZenStack 生成物 | 直接編集禁止。Zod スキーマや hook が存在。 |

---

## 4\. レイヤーと依存ルール

| レイヤ | 主な配置 | 依存可能 | 制約 |
| :---- | :---- | :---- | :---- |
| Routes (`src/routes/**`) | `+page.server.ts`, `+server.ts` | features, flows, shared routes, adapter (Repository) | Prisma 直呼びは `src/routes/admin/**` のみ許可。他は Repository/Feature 経由。 |
| Shared Routes | `src/lib/server/routes/**` | features, adapter, shared | ルートから呼び出される共有ハンドラ。 |
| Flows | `src/lib/server/flows/**` | features, adapter, shared | 2 つ以上のユースケースを束ねる場合のみ。 |
| Features | `src/lib/server/features/**` | adapter, shared | command/query を中心に実装。設計を先に書き下す。 |
| Adapter | `src/lib/server/adapter/**` | shared, providers | DB・外部サービス。Mock は同階層に配置。 |
| Providers | `src/lib/server/providers/**` | shared | Sentry や API クライアントの初期化。 |
| Shared | `src/lib/server/shared/**` | — | DI コンテナ・port・共通ロジック。 |
| Generated | `src/lib/generated/**` | 全レイヤ | ZenStack 自動生成。編集禁止。 |

- ルート配下で Prisma を利用したい場合は、まず admin ルートかを確認。一般ルートは Repository を経由して副作用を局所化する。  
- 共有したいロジックは `types/` と `routes/` / `shared/` を利用し、コピー＆ペーストを避ける。

---

## 5\. 認証・セッション・デバッグログイン

### 5.1 ベースライン

- 利用可能ライブラリ: **Auth.js** (SvelteKit adapter) または **Better Auth**。  
- `src/lib/server/auth.ts` で `createAuth()` 相当の初期化を行い、以下を提供する:  
  - `handle` フックのラッパー (`handleAuth`) を hooks.server.ts に統合  
  - `requireAuth`, `requireAdmin`, `currentUser` などのヘルパー  
  - セッションストレージは Prisma Adapter を推奨  
- サインイン戦略: Email/Password \+ OAuth など、プロジェクト要件に応じて Auth.js / Better Auth の Provider を設定。

### 5.2 デバッグログイン仕様

開発時の迅速な検証のため、デバッグログインを標準化する。

| 項目 | 内容 |
| :---- | :---- |
| エンドポイント | `GET /debug/login` |
| クエリ | `email` (必須), `redirect_to` (任意、URL エンコード。デフォルト `/`) |
| 実装概要 | 1\) `requireNonProduction()` で `NODE_ENV !== "production"` を担保。2) 指定メールのユーザーを Auth.js/Better Auth のアダプタ経由で取得。3) セッションを発行し、`setSession` or `createSession` で Cookie を設定。4) `redirect_to` が安全なパスか検証してからリダイレクト。 |
| セキュリティ | \- 本番では常に 404 を返す。 |

- 存在しないメール指定時は 400 を返しログに記録。  
- 利用したメールアドレスとアクセス元 IP を `dev.log` に残す。 | | 例 | `http://localhost:5005/debug/login?email=admin@example.com&redirect_to=%2Fadmin` |

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

---

## 6\. データアクセスと型管理

1. **ZenStack を中心に**: `schema.zmodel` を編集し、`bun run db:generate` で Prisma スキーマと型を生成。型はできるだけ作らない。  
2. **生成 Zod の活用**: `src/lib/generated/zod` 等に出力される Zod スキーマをバリデーションに利用。API 入力の型は `infer<typeof Schema>` を用いる。  
3. **types/ ディレクトリ**: 複数箇所で共有する手書き型を `src/lib/server/types/**` に配置。ZenStack 型にエイリアスを付ける場合もここに置く。  
4. **データ取得の優先順**:  
   - クライアント: ZenStack hooks (`useFindManyXxx` など)  
   - サーバー: features/command & query → flows → shared routes の順で再利用を検討  
   - 管理画面: Prisma 直呼び出し可（admin ルート内に限定）  
5. **トランザクション**: 複数操作をまとめたい場合は features の command 内で Prisma Transaction API を使用。

---

## 7\. モック利用ポリシー

- **原則**: 本番実装を使う。Mock はテスト・サンドボックス目的で必要性が明確な場合のみ利用。  
- **配置**: `adapter/repository/mock/`, `adapter/service/mock/`。  
- **運用**: DI コンテナ (`shared/container.ts`) の override 機能をテストでのみ使用し、通常実行時は Mock をロードしない。`USE_MOCK_IMPLEMENTATIONS` のようなフラグは開発環境限定。  
- **テスト**: 外部 API を叩けない場合は Mock を注入するが、契約テストで実装との差異がないかを確認する。

---

## 8\. 開発プロセス（TDD）

Red-Green-Refactor サイクルをミニマムステップで繰り返し、常に動作するコードとテストを同時に進化させる。各ステップで「誰の視点で考えるか」「どこまでやるか」を明確に分け、余計な実装を避ける。

1. **Red（利用者視点のテスト記述）**  
     
   - まず期待する振る舞いをテストで明文化し、必ず失敗させる。コンパイルエラーも Red と捉える。  
   - テスト名は仕様をそのまま文章化し、前提条件→操作→期待結果が一目で分かるように Arrange/Act/Assert を明示する。  
   - ベビーステップ規律: 「小さく書く・すぐ実行する・1 つの失敗理由に集中する」。サポート関数や最適化は後回しにし、理想の API 形状をテストコードで先にデザインする。

   

2. **Green（実装者視点での最短経路）**  
     
   - テストを通すことだけを目的に、最小限のコードを書く。必要ならハードコードや分岐なしの仮実装でも構わない。  
   - Red で想定した失敗理由と実際のエラーが一致しているかを確認し、意図しないバグを拾いきれているかをチェック。  
   - この段階では美しさよりスピードを優先し、YAGNI（不要な機能を先取りしない）を徹底する。

   

3. **Refactor（設計者視点での整理）**  
     
   - Green を確認したら、ZenStack 生成型や共有ユーティリティへ寄せ、重複・命名・境界を整える。  
   - テストコード自身もリファクタリング対象。可読性と仕様ドキュメントとしての価値を高める。  
   - 振る舞いを変える変更は行わず、必ずテストが常にグリーンである状態を維持する。

   

4. **ルート統合と反復**  
     
   - command/query/flow で通ったテストを土台に、`+page.server.ts` や API ルートへ組み込み、UI を接続する。  
   - 新しい仕様が生まれたら再び Red から始め、小さな成功体験を積み重ねる。

---

## 9\. コーディングガイドライン

### 9.1 型と引数

- `any` 禁止。必要に応じて `unknown` \+ ナロイング、または Zod で検証。  
- Nullable/Optional 引数は避け、呼び出し元で事前検証する。  
- デフォルト引数は使用しない。呼び出し時に明示的に渡す。

### 9.2 エラーハンドリング

- 例外を握りつぶさない。`try/catch` ではログと再throw・リトライ等の方針を明確化。  
- 過度なフォールバック（`?? ""`, `?? 0`）で失敗を隠さない。

### 9.3 コード構造

- 重複ロジックは `routes/`・`shared/`・`types/` へ抽出。判断がつかない場合は相談。  
- 同じ条件判定を複数回書かない（意図的であればコメント）。  
- 不要な `as` や冗長な null チェックを避ける。

### 9.4 テスト

- テストは仕様のドキュメントとして扱う。命名で振る舞いが分かるように。  
- `src/lib/server/test/scenarios/**` の各ケース直前に `// flow:` コメントを記述。  
- カバレッジ目安は 80% 程度。CICD で `bun run test` を必ず実行。

### 9.5 レビュー観点

- 上記原則に加え、`any` 有無、無駄な抽象化、Null の扱い、例外処理、DRY を重点的に確認。

---

## 10\. 観測性とデバッグ

1. **Sentry**  
     
   - `hooks.client.ts` / `hooks.server.ts` で初期化。  
   - `src/lib/server/util/logger.ts` から Sentry へログ転送。  
   - `scripts/sentry-log-test.ts` で手動検証可能。

   

2. **ログ**  
     
   - アプリ: `dev.log`  
   - 定期実行: `cron.log`  
   - エラーは必ずスタックトレース付きで出力。

   

3. **デタッチ起動**

```shell
# scripts/dev-detach.sh
#!/usr/bin/env bash
set -eu
bun run dev >dev.log 2>&1 &
echo $! > .dev.pid
```

停止時は `bun run kill` または `kill $(cat .dev.pid)`。

4. **デバッグログイン**  
   - 仕様は §5.2 を参照。  
   - 利用履歴を `dev.log` に残し、Sentry にも送信できるよう logger を呼び出す。

---

## 11\. 実装パターン

### 11.1 共有サーバーアクション

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

### 11.2 管理ルートでの Prisma 使用

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

### 11.3 Feature command

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

### 11.4 Flow

```ts
// src/lib/server/flows/reminder/handler.ts
import { fetchPendingDeliveries } from "$lib/server/features/delivery/query/fetch-pending/handler"
import { sendReminder } from "$lib/server/features/contact/command/send-reminder/handler"

export async function executeMonthlyReminder() {
  const deliveries = await fetchPendingDeliveries()
  await Promise.all(deliveries.map((item) => sendReminder(item)))
}
```

### 11.5 API ルート

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

---

## 12\. 運用コマンド

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

---

## 15\. 実装手順（TDDベース）

1. **テスト実装**  
     
   - Red フェーズで仕様をテストとして表現する。テスト名に振る舞いを直書きし、前提→操作→期待値を分ける。  
   - コンパイルエラーを恐れず、理想の API 形状をテストでデザインする。曖昧な要件はこのタイミングでプロダクトオーナーに確認する。  
   - ベビーステップを徹底し、一度に 1 つの主張だけをチェックする。テストを追加するたびに直ちに実行し、既存テストがグリーンであることを確認してから次に進む。

   

2. **実装**  
     
   - Green フェーズではテストを通すことだけに集中し、最小限のコードで期待動作を満たす。必要ならハードコードや暫定分岐も許容する。  
   - ZenStack の型や既存ユーティリティを活用し、不要な型宣言や抽象化を避ける。Mock を常用しない方針を忘れず、本番コードをそのまま使う。  
   - 例外やエッジケースはテストで裏付けが取れてから追加し、YAGNI（先取り実装しない）を徹底する。

   

3. **リファクタリング**  
     
   - Refactor フェーズで重複排除・命名整理・責務分割を行う。テストコードも対象に、可読性と仕様説明力を高める。  
   - ZenStack 生成型や共有ロジックへ寄せ、`types/` へ新規型を追加する場合は多重利用が確定しているか見極める。常に「テストが保護網になっているか」を確認する。  
   - 振る舞いを変える変更はこの段階では禁止。テストが常にグリーンであることを確認しながら小さく進める。

---

## 16\. 設計手順

0. **UI をモックで作成**  
     
   - 画面遷移と主要 UI コンポーネントをsrc/routes/mock/\*\* にモック化し、ユーザー（プロダクトオーナー）のレビューを必ず受ける。

   

1. **テーブル設計**  
     
   - モデル・リレーション・インデックスを `schema.zmodel` のドラフトで設計する。正規化と性能を意識し、履歴テーブルや外部キー制約を明示。  
   - 設計後はユーザーとレビューし、ビジネスルールとの齟齬がないかを確認。承認を得てから ZenStack へコミットする。

   

2. **型整理**  
     
   - ZenStack 生成型で賄えないものを最小限洗い出し、`types/` に置く候補をメモ。不要な型を増やさないよう、利用箇所が複数存在するか必ず検証する。  
   - 型追加案は開発チームでレビューし、既存の Zod スキーマで代替できないかを議論する。

   

3. **flow / command / query 設計**  
     
   - 各ユースケースで必要な入力・出力・副作用・エラーを文章化。sequence diagram などで結合順を整理する。  
   - 設計ドキュメント（Issue や PR テンプレート）に記載し、ユーザー／開発チームのレビューを受けてから実装に進む。

   

4. **各フロー実装**  
     
   - 決定した設計に基づき、TDD のステップで command → query → flow の順に実装。ZenStack 生成型・既存ユーティリティを最大限利用する。  
   - 実装後はユーザーに振る舞いをデモし、追加要望や仕様差異があれば再度設計ステップへ戻る。

---

## 17\. レビュー手順

コーディングガイドラインを確認し、レビューを行う。  
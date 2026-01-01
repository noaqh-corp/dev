# アーキテクチャ
version: 1.0.0
date: 2025-10-18

変更履歴:
- 2025-10-18: 初版

## 1. 目的と背景

このドキュメントは、TypeScript (strict) を用いたバニラプロジェクトにおいて、アーキテクチャの意図・ディレクトリ構造・開発プロセス・運用フローを共有します。
ドメイン的振る舞い、外部サービスとの連携など複雑な実装をテスト容易性を保ちながら実装するためのアーキテクチャです。おもにバックエンドでの利用を想定しています。

### 1-1 既存のアーキテクチャの課題感
ドメイン駆動開発や、クリーンアーキテクチャは弊社が関わるプロジェクトの特徴からするとTooMuchArchitectureである。弊社は0→1開発が非常に多く、ドメイン駆動設計は設計工程に時間がかかりすぎ、ファイル数も非常に増えてしまうためオーバーエンジニアリングである。

### 1-2 このアーキテクチャの意図
このアーキテクチャでは、command/query/flowにCQRSの考え方でドメイン的振る舞いを内包することがポイントである。これにより、モジュールに対応したクラスにドメイン的振る舞いを内包することなく操作(operation)を達成でき、後述するAdapter層でモックを用いることで特殊な状態を再現したテストも容易に行える。
また、操作(operation)に合わせてドメイン的振るまいをディレクトリ内に閉じこめることで、AIを活用した開発において最小限のコンテキストで開発を行えるようにすることができる。
対応するテストも同じディレクトリ内に配置し、独立したモジュールとして管理することで、テストコードも最小限のコンテキストで管理できる。

## 2. ドメイン振る舞いの設計コンセプト
ビジネスの決まりごとや判断を、機能ごとに小さく分けて書きます。
「読むだけの処理」と「状態を変える処理」を分ける考え方 → コマンド・クエリの分離（CQRS）を採用します。外部サービス(外部APIやDB)への出入りは、直接触らず「port」で受けます。このport → ポート（Port）、実体の配線 → アダプター（Adapter）と呼びます。

* 操作(operation)単位で最小化する：command/は状態変更、query/は参照だけ。混ぜない。
* 外部とのやりとりは port 経由に限定する。テストでは mock を差し替えて再現性を高める。
* 型は ZenStack 生成物を基準にする。入力は Zod で検証し、出力は型で保証する。
* 複数操作(operation)をまたぐ順序や再試行は flow に寄せ、ドメインの判断は feature に置く。

### 2-1. featuresディレクトリ
ドメインごとに分け、そのドメイン内でドメイン的振る舞いを実現する。

* 構成の例

  ```
  features/<domain>/
    command/<operation>/handler.ts     // 状態を変える(後述)
    command/<operation>/handler.test.ts     // テスト(後述)
    query/<operation>/handler.ts       // 読み取りだけ(後述)
    query/<operation>/handler.test.ts       // テスト(後述)
    utils.ts     // ユーティリティ関数
    types.ts     // 型定義
  ```
* ルール

  * types.tsには、そのDomain内で使用する型を定義する。もし、他Domainでも使用する型があれば、`shared/types`に定義する。
  * Prisma生成型、Zod生成型はtypes.ts内部でのみ利用可能。生成型はexportしない。
  * types.tsからexportする型は、Prisma生成型やZod生成型を元に作成した手書き型のみ。
  * command/query内で型が必要な場合は、types.tsに定義してそこからimportする。
  * DB・外部APIは触らない。`shared/port` のインターフェースを使い、実体はコンテナから受け取る。
  * 例外と業務エラーを分ける。接続失敗などは例外で落とし、仕様上の不一致は戻り値や型で表す。
  * 取引のまとまり（トランザクション）は command 側で開始・終了する。query では持たない。
  * utils.tsには、そのドメイン内でのみ使用するかつ、**複数の操作(operation)で共通で使用する関数**を定義する。
* テスト

  * 基本は同階層で操作(operation)単位のテストを置く。

#### 2-1-1. commandディレクトリ
変更を行う操作(operation)を実装する。

* 構成の例

  ```
  features/<domain>/
    command/<operation>/handler.ts     // 状態を変える
    command/<operation>/handler.test.ts     // テスト
    [command/<operation>/<name>.ts]     // hander.tsが長大になった場合に適切に分割する
    
  ```

* ルール

  * 変更を行う操作(operation)は command 側で行う。
  * 特にドメイン的振る舞いが無く、保存のみを行う場合はoperationは作成しない。ドメイン的に重複チェックや、バリデーションを行う場合はoperationを作成する。
  * 命名は意味的にわかりやすく、操作(operation)を表すようにする。update-userなどの実装に寄りすぎた命名は避ける。
    
    Good:
        features/notification/send-push-notification/handler.ts
        features/product/purchase-item/handler.ts
    Bad:
        features/user/update-user/handler.ts
        features/contact/create-contact/handler.ts

  * hander.tsが長大になった場合に適切に分割する。<name>.tsを作成する。

  * `search(input: SearchInput): SearchResult`のように~Input, ~Resultなどの型を絶対に作成しない。`search(userId?: string, tenantId?: string, limit?: number, offset?: number): Promise<{
    items: User[],
    total: number,
    page: number,
    pageSize: number,
  }>`のような型を定義を行い、無駄な~Input, ~Resultなどの型を定義しない。
  * 基本的に返り値はvoidであるが、性質上特殊な返り値が必要な場合は、handler.ts内で必要最小限のプロパティのみ定義した型を定義する。
  * Prisma生成型、Zod生成型は使用しない。必要な型はfeatures/\<domain\>/types.tsまたはshared/typesで手書き型として定義する。
  * handler.ts内で型定義は行わない。必ず types.ts に集約する。

#### 2-1-2. queryディレクトリ
queryディレクトリは、読み取りだけの副作用がない操作(operation)を実装する。

* 構成の例

  ```
  features/<domain>/
    query/<operation>/handler.ts       // 読み取りだけ
    query/<operation>/handler.test.ts       // テスト
    [query/<operation>/<name>.ts]     // hander.tsが長大になった場合に適切に分割する
  ```

* ルール

  * 単純な読み取りや検索のみはRepositoryを使用する。
  * 命名は意味的にわかりわすく、操作(operation)を表すようにする。get-user-profileなどの実装に寄りすぎた命名は避ける。list-taskなど、内部でRepositoryを呼び出すだけのようなoperationは絶対作成しない。
    
    Good:
        features/ticket/list-available-tickets/handler.ts
        features/product/list-purchased-products/handler.ts
    Bad:
        features/user/get-user-profile/handler.ts
        features/order/get-order-detail/handler.ts
        features/ticket/list-tickets/handler.ts

  * hander.tsが長大になった場合に適切に分割する。<name>.tsを作成する。
  * 基本的に型は新規作成しない。features/\<domain\>/types.ts、shared/typesに定義されている型を使用する。
  * Prisma生成型、Zod生成型は使用しない。必要な型はfeatures/\<domain\>/types.tsまたはshared/typesで手書き型として定義する。
  * handler.ts内で型定義は行わない。必ず types.ts に集約する。

### 2-2. flowsディレクトリ

複数の操作(operation)を「どの順番で」「いつ」「失敗したらどうするか」をまとめます。
操作(operation)をまとめて管理すること → フローと呼びます。

* 役割

  * スケジューラ起動（cron）やWebhookの入口から、必要な command/query を順に呼ぶ。
  * リトライ・冪等性（同じ入力で何度呼んでも重複しない）の担保、監視ログの記録。
  * ドメインの判断は書かない。判断は常に features/ に置く。
* 構成の例

  ```
  flows/<operation>/
    handler.ts      // メイン手順
    handler.test.ts // テスト
  ```
* テスト

  * 同階層で操作(operation)単位のテストを置く。

---

## 3. それ以外の設計コンセプト

上記以外の横断ルールをまとめます。

* 依存の向き：上位（routes/flows/features）→ port → adapter。実装詳細（Prismaや外部SDK）は下位に閉じ込める。
* 入力境界の検証：HTTPのPayloadや、CLIなどの外部入力は必ず Zod で検証してからドメインに渡す。各ドメインの引数として、zodのスキーマは利用してはならない。
* 設定の初期化：外部SDKやSentryなどは providers/ で初期化し、コンテナから渡す。
* 例外扱い：通信・権限・タイムアウトはログを残し再試行方針を決める。業務エラーは戻り値で表現してUIへ伝える。
* 管理画面の例外：`/routes/admin/**` のみ Prisma 直接利用を許可（運用効率を優先）。それ以外は port 経由。

### 3-1. shared/portディレクトリ

外部とやりとりするための「インターフェース」だけを置きます。

* 設計方針

  * 機能名＋役割で名付ける（例：`UserRepository`, `DiscordService`）。
  * 引数・戻り値は「必要最小限の形」にする（Prismaの生型は漏らさない）。
  * 失敗は型で表すか、投げる例外の型を限定する。どちらにするかをポートごとに決めて統一する。
  * 変更が多いのはアダプター側。port はできるだけ安定させる。

### 3-2. shared/typesディレクトリ

手書き型を置く場所です。ここに置くのは「複数Domain・複数箇所で繰り返し使う型」だけにします。

* 構成の例

  ```
  shared/types/
    types.ts     // 型定義
    errors.ts     // エラー型
  ```

* ガイド

  * Prisma生成型、Zod生成型はtypes.ts、Repository内部でのみ利用可能。生成型はexportしない。
  * types.tsからexportする型は、Prisma生成型やZod生成型を元に作成した手書き型のみ。
  * 単一ドメイン内でのみ使用する型は、features/\<domain\>/types.tsに定義する。
  * 名前は役割がわかるように（例：`User`, `Product`）。
  * ~Input, ~Resultなどの型は定義しない。
  * UI専用など局所的な型は、その場に閉じ込める（ここへは出さない）。
  * 引数の入力型として、Zodは使わない。シンプルにuser_id: stringなどの型を定義する。
  * 返り値の型は、シンプルに{ success: boolean, message: string }などの型を定義する。

### 3-3. shared/adapterディレクトリ

port の実体を置きます。DBなら Prisma、外部サービスなら各SDKを使います。

* 構成

  ```
  adapter/
    repository/      // DB 実装（Prisma）
      mock/          // テスト用モック
    service/         // 外部API実装（SDK）
      mock/
  ```
* ルール

  * ここから上位（features/flows）へは port で返す。実装詳細は漏らさない。
  * モックはテスト専用。通常実行時は本番実装を使う。
  * 接続設定や資格情報は providers/ で初期化し、コンテナ経由で注入する（交換可能性を保つ）。
  * 例外は発生源で文脈を付けて投げ直す（再試行可否・原因区分を付ける）。

#### 3-3-1. repository

* 構成の例

  ```
  adapter/
    repository/
      mock/
  ```

* ルール
  * モックはテスト専用。通常実行時は本番実装を使う。
  * Prisma生成型、Zod生成型はRepository内部でのみ利用可能。生成型はexportしない。
  * Repository外部で必要な型は、shared/types/types.tsで手書き型として定義する。
  *　一般的な以下のメソッドを定義する。

  ```
  * get(id: string): Promise<Item>
  * search(userId?: string, tenantId?: string, limit?: number, offset?: number): Promise<{
    items: User[],
    total: number,
    page: number,
    pageSize: number,
  }>
  * create(data: Partial<Item>): Promise<Item>
  * update(id: string, data: Partial<Omit<Item, 'id'>>): Promise<Item>
  * delete(id: string): Promise<void>

  ```


#### 3-3-2. service

* 構成の例

  ```
  adapter/
    service/
      mock/
  ```

* ルール

  * 外部サービス連携で利用するメソッドを定義する
  * 内部でRepositoryには依存しない。
  * ライブラリからimportした型はそのまま使用せず、shared/types/types.tsで手書き型として定義する。
  * Service内部で生成型を使用する場合は、exportしない。
  * Serviceはfeatures/**、flows/**に依存しない。
  * DiscordServiceの例
  ```
  // サービス特有の処理はshared/types/types.tsではなく、Service内部で定義する
  export type Channel = {
    id: string
    name: string
    description: string
  }
  export type SendMessageResult = {
    status: 'success' | 'error'
    messageId: string
  }

  // shared/port/DiscordService.ts
  export interface DiscordService {
    sendMessage(channelId: string, message: string): Promise<SendMessageResult>
    listChannels(): Promise<Channel[]>
  }
  ```

---

## 3\. ディレクトリ構造

basedirはsrc/が存在すればsrc/、存在しなければ.がベースとなる。
Sveltekitの場合はsrc/lib/server/がベースとなる。convex(https://www.convex.dev/)の場合はconvex/がベースとなる。また、convexではディレクトリ名に-は使用できない。snake_caseで命名する。

```
.
├── [basedir]/
│   ├── adapter/
│   │   ├── repository/           # ORM実装
│   │   │   ├── UserRepository.ts
│   │   │   ├── ProductRepository.ts
│   │   │   └── mock/
│   │   │       ├── UserRepository.ts
│   │   │       └── ProductRepository.ts
│   │   └── service/              # 外部サービス実装
│   │       ├── DiscordService.ts
│   │       ├── LineWorksService.ts
│   │       └── mock/
│   │           ├── DiscordService.ts
│   │           └── LineWorksService.ts
│   ├── features/                 # ドメイン操作(operation) (command/query 中心)
│   │   ├── notification/
│   │   │   ├── command/
│   │   │   │   └── send-push-notification/
│   │   │   │       ├── handler.ts
│   │   │   │       └── handler.test.ts
│   │   │   ├── query/
│   │   │   │   └── list-available-notifications/
│   │   │   │       ├── handler.ts
│   │   │   │       └── handler.test.ts
│   │   │   ├── utils.ts
│   │   │   └── types.ts
│   │   └── product/
│   │       ├── command/
│   │       │   └── purchase-item/
│   │       │       ├── handler.ts
│   │       │       └── handler.test.ts
│   │       └── query/
│   │           └── list-purchased-products/
│   │               ├── handler.ts
│   │               └── handler.test.ts
│   ├── flows/                    # 複数操作(operation)のフロー
│   │   ├── reminder/
│   │   │   ├── handler.ts
│   │   │   └── test.ts
│   │   └── document-package-process/
│   │       ├── handler.ts
│   │       └── test.ts
│   ├── shared/                   # DI コンテナ・port・共通定数
│   │   ├── port/                 # 抽象インターフェース
│   │   │   ├── UserRepository.ts
│   │   │   ├── ProductRepository.ts
│   │   │   ├── DiscordService.ts
│   │   │   └── LineWorksService.ts
│   │   ├── types/                # 複数箇所で使う手書き型
│   │   │   ├── types.ts
│   │   │   └── errors.ts
│   │   └── container.ts          # DIコンテナ（依存性注入）
│   ├── entrypoint/               # cron.ts / cli.ts 等
│   │   ├── cron.ts
│   │   └── cli.ts
│   ├── (convexの仕様上、convex直下に置かないといけないファイル ex: auth.ts,schema.ts,etc....)
│   ├── convex_operation/    # ConvexのMutationとQueryを置くディレクトリ | Convexを採用しているプロジェクトのみで作成する。
│   │   ├── {domain}/
│   │   │   ├── {mutation_or_query_name}.ts # ex: user/get_user.ts
│   │   │   └── ...
│   │   └── util/ # Convexのmutiation or queryでの共通処理をここに記述する。
│   │       └── user.ts # userに関する共通処理をここに記述する。例えばuserの権限取得などなど。
│   └── util/                  # サーバーユーティリティ（logger 等）
│       └── logger.ts
```

**主要ディレクトリの役割**

| ディレクトリ | 役割 | ポイント |
| :---- | :---- | :---- |
| `features/<Domain>` | 操作(operation)単位の command/query | まずここから設計を始める。`core/` は作らない。 |
| `flows/<Flow>` | 複数操作(operation)の組み合わせ | 状態遷移や通知など横断処理を集約。 |
| `shared/port` | 抽象インターフェース | Adapter 実装の契約を定義。 |
| `shared/types` | 手書きの共有型 | ZenStack で賄えない複数箇所共有型のみ配置。 |
| `adapter/*/mock/` | テスト用 Mock | 原則テスト専用。常用しない。 |
| `convex-operation/` | Convexでは事前に定義された記法でMutationとQueryを定義する。ドメインごとにディレクトリを作成し、その中にMutationとQueryを定義する。ここにはビジネスロジックは絶対に含まない。flow,commmand,queryを呼び出すだけのPresenter層として利用する。 | Convexを採用しているプロジェクトのみで作成する。 |

---

## 4\. レイヤーと依存ルール

| レイヤ | 主な配置 | 依存可能 | 制約 |
| :---- | :---- | :---- | :---- |
| Flows | `flows/**` | features, adapter, shared | 2 つ以上の操作(operation)を束ねる場合のみ。 |
| Features | `features/**` | adapter, shared | command/query を中心に実装。設計を先に書き下す。 |
| Adapter | `adapter/**` | shared, providers | DB・外部サービス。Mock は同階層に配置。 |
| Shared | `shared/**` | — | DI コンテナ・port・共通ロジック。 |
| Convex-operation | `convex-operation/**` | features, flows, shared | Convexを採用しているプロジェクトのみで作成する。 |

---

## 4-1. 依存性注入（DI）とコンテナ

このアーキテクチャでは、`shared/container.ts` を使用して依存性注入を実現します。これにより、テスト時にモック実装への切り替えが容易になり、実装の交換可能性が保たれます。

### 4-1-1. コンテナの実装

`shared/container.ts` は、シングルトンパターンでインスタンスを管理し、環境変数によってモック実装への切り替えを制御します。

```typescript
// shared/container.ts
import type { AdminUserRepository } from "./port/AdminUserRepository";
import { AdminUserRepositoryPrisma } from "../adapter/repository/AdminUserRepository";
import { AdminUserRepositoryMock } from "../adapter/repository/mock/AdminUserRepository";
import { getConfig } from "../util/config";

class Container {
  private static instances = new Map<string, unknown>();
  private static useMock = getConfig("USE_MOCK_IMPLEMENTATIONS") === "true";

  // Repository
  static getAdminUserRepository(): AdminUserRepository {
    const key = "AdminUserRepository";
    if (!Container.instances.has(key)) {
      const instance = new AdminUserRepositoryPrisma();
      Container.instances.set(key, instance);
    }
    return Container.instances.get(key) as AdminUserRepository;
  }

  // Service
  static getDiscordService(): DiscordService {
    const key = "DiscordService";
    if (!Container.instances.has(key)) {
      const instance = new DiscordServiceImpl();
      Container.instances.set(key, instance);
    }
    return Container.instances.get(key) as DiscordService;
  }

  // テスト用: インスタンスをクリア
  static clear(): void {
    Container.instances.clear();
  }

  // テスト用: 特定の実装をオーバーライド
  static override<T>(key: string, instance: T): void {
    Container.instances.set(key, instance);
  }
}

export default Container;
```

### 4-1-2. 使用例

#### features/command での使用

```typescript
// features/user/command/register-admin/handler.ts
import Container from "../../../../shared/container";

export async function registerAdmin(email: string, name: string): Promise<void> {
  // Repositoryを取得
  const adminUserRepo = Container.getAdminUserRepository();
  
  // ~~省略~~
}
```

#### テストでの使用

```typescript
// features/user/command/register-admin/handler.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import Container from "../../../../shared/container";
import { AdminUserRepositoryMock } from "../../../../adapter/repository/mock/AdminUserRepository";
import { registerAdmin } from "./handler";

describe("registerAdmin", () => {
  beforeEach(() => {
    Container.clear();
  });

  it("新規管理者を登録できる", async () => {
    // モックをオーバーライド。必ずitの最上部に記載する。
    Container.override("AdminUserRepository", new AdminUserRepositoryMock());

    // モックが有効なので、モックの実装が呼ばれる。
    await registerAdmin("admin@example.com", "Admin User");
    // ~省略~
  });
});
```

### 4-1-3. ルール

- **コンテナの責務**: インスタンスの生成と管理のみ。ビジネスロジックは含めない。
- **シングルトン管理**: 同じキーに対して常に同じインスタンスを返す。
- **モック切り替え**: 環境変数 `USE_MOCK_IMPLEMENTATIONS` で制御。本番環境では必ず `false`。
- **テスト時のオーバーライド**: `Container.override()` を使用して特定の実装を差し替え可能。
- **クリーンアップ**: テストの `beforeEach` で `Container.clear()` を呼び出し、状態をリセット。

---

## 5\. データアクセスと型管理

1. **ZenStack を中心に**: `schema.zmodel` を編集し、`bun run db:generate` で Prisma スキーマと型を生成。型はできるだけ作らない。
2. **生成 Zod の活用**: `src/lib/generated/zod` 等に出力される Zod スキーマをバリデーションに利用。API 入力の型は `infer<typeof Schema>` を用いる。
3. **types/ ディレクトリ**: 複数箇所で共有する手書き型を `src/lib/server/types/**` に配置。ZenStack 型にエイリアスを付ける場合もここに置く。
4. **生成型の利用制限**:
   - Prisma生成型、Zod生成型は Repository内部、types.ts内部でのみ利用可能
   - Repository、types.tsから生成型をexportしない
   - 他の箇所で必要な型は、types.tsで手書き型として定義する
5. **データ取得の優先順**:
   - クライアント: ZenStack hooks (`useFindManyXxx` など)
   - サーバー: features/command & query → flows → shared routes の順で再利用を検討
   - 管理画面: Prisma 直呼び出し可（admin ルート内に限定）
6. **トランザクション**: 複数操作をまとめたい場合は features の command 内で Prisma Transaction API を使用。

---

## 6\. モック利用ポリシー

- **原則**: 本番実装を使う。Mock はテスト・サンドボックス目的で必要性が明確な場合のみ利用。
- **配置**: `adapter/repository/mock/`, `adapter/service/mock/`。
- **運用**: DI コンテナ (`shared/container.ts`) の override 機能をテストでのみ使用し、通常実行時は Mock をロードしない。`USE_MOCK_IMPLEMENTATIONS` のようなフラグは開発環境限定。
- **テスト**: 外部 API を叩けない場合は Mock を注入するが、契約テストで実装との差異がないかを確認する。

---

## 7\. 開発プロセス（TDD）

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


## 8\. command/query/flowの実装サンプル

### 8-1. handlerの実装サンプル

#### Good:

```typescript
// Containerをインポートできている。
import Container from "$lib/server/shared/container";


// 無駄な型(~Input, ~Result)を定義していない。
// 返り値が最小限かつ説明的である。
export async function registerAdmin(email: string, name: string): Promise<{
  userId: string;
}> {
  // Repositoryを取得
  const adminUserRepo = Container.getAdminUserRepository();
  // Repositoryのメソッドを呼び出す。
  const result = await adminUserRepo.create({ email, name });
  return result.userId;
}
```

#### Bad:

```typescript

// Repository,Serviceは必ずContainerから取得する。
import { AdminUserRepositoryPrisma } from "$lib/server/adapter/repository/AdminUserRepository";

// 無意味なヘルパー関数により不必要なimportを行っている
import type { AdminUserRepositoryCreateOutput } from "$lib/server/adapter/repository/AdminUserRepository";

// 無意味な型を定義してはいけない
type RegisterAdminInput = {
  email: string;
  name: string;
}

// 無意味な型を定義してはいけない
type RegisterAdminResult = {
  userId: string;
  // 不要なカラムを返してはいけない。最小限のカラムのみ返す。
  message: string;
}

// 無意味なヘルパー関数を作成してはいけない。
const parseOutputValue = (outputValue: AdminUserRepositoryCreateOutput): RegisterAdminResult => {
  return {
    userId: outputValue.userId,
    message: outputValue.message,
  }
}

export async function registerAdmin(input: RegisterAdminInput): Promise<RegisterAdminResult> {
  // 直接インスタンスを作成してはいけない。
  const adminUserRepo = new AdminUserRepositoryPrisma();
  // Repositoryのメソッドを呼び出す。
  const result = await adminUserRepo.create(input);

  // 無意味な変数を作成してはいけない。
  const outputValue = {
    userId: result.userId,
    message: "success",
  }

  return parseOutputValue(result);
}
```

#### Bad2:

```typescript
// 
import {z} from "zod";

// 入力のバリデーションスキーマをzodで定義してはいけない。zodのバリデーションはフォーム入力や、httpリクエストのバリデーションなど不明な入力に対してのみ使用する。
const registerAdminInputSchema = z.object({
  email: z.string(),
  name: z.string(),
});

export async function registerAdmin(input: z.infer<typeof registerAdminInputSchema>): Promise<void> {
  // 入力をバリデーションにzodを仕様してはいけない。
  const validatedInput = registerAdminInputSchema.parse(input);
}

```

### 8-2. types.tsの実装サンプル
[basedir]/features/<domain>/types.tsについて

#### VeryGood:

```typescript
// 生成された型の再エクスポートをしており、複数箇所での型定義重複を避けている。また、types.tsから再エクスポートすることで意味的な型を持ち回すことができる。
import type { User as UserPrisma } from "$lib/server/generated/zod";
export type User = UserPrisma;
```

#### Good:
```typescript
// 手書き型を定義する。DB定義前等の場合はこちらを使用する。
export type User = {
  id: string;
  name: string;
};
```

#### Bad:

```typescript

import type { User as UserPrisma } from "$lib/server/generated/zod";
// 無駄な型を定義してはいけない。
export type UserId = string;


export type User = {
  // 無駄な型に依存してはいけない。
  id: UserId;
  // 中途半端に生成型を使用してはいけない。
  name: UserPrisma['name'];
}
// 引数の入力用の無駄な型は定義してはいけない。
export type RegisterAdminInput = {
  email: string;
  name: string;
}
// 返り値の無駄な型は定義してはいけない。
export type RegisterAdminResult = {
  userId: string;
}

```

### 8-3. repositoryの実装サンプル
[basedir]/adapter/repository/<domain>Repository.tsについて

#### Good:

```typescript

import { PrismaClient } from '$lib/server/generated/client';
// 型を適切にimportしており適切なものを使用している。
import type { Charge } from '$lib/server/features/billing/types';
// キチンとportをimportしており適切なものを使用している。
import type { BillingRepository } from '$lib/server/adapter/port/billingRepository';

const prisma = new PrismaClient();

export class BillingRepositoryPrisma implements BillingRepository {
    // Omitを活用することで新たな型を定義せずに、最小限かつコンパクトな実装ができている。
    async createCharge(input: Omit<Charge, 'id'>): Promise<Charge> {
        // 適切に型を利用することでmapなど型変換の関数を実装しなくても返り値、入力値が適切な型であることを保証できている。
        return await prisma.charge.create({
            data: input,
        });
    }
    // 適切に型を利用することで、メソッドの引数が適切な型であることを保証できている。
    // 入力にInput型を定義せず、引数のみでメソッドの入力を定義している。検索系のメソッドのみオプショナルな引数を持つことができている。
    // orderBy, orderDirectionを定義することで並べ替えを行うことができている。
    // offset, limitを定義することでページングを行うことができている。
    async searchCharges(userId?: string, tenantId?: string, limit?: number, offset?: number, orderBy?: 'createdAt' | 'updatedAt' | 'amount' | 'description', orderDirection?: 'asc' | 'desc'): Promise<Charge[]> {
        const where: Prisma.ChargeWhereInput = {};
        if (userId) {
            where.userId = userId;
        }
        if (tenantId) {
            where.tenantId = tenantId;
        }
        const orderByInput: Prisma.ChargeOrderByWithRelationInput = {};
        if (orderBy && orderDirection) {
            orderByInput[orderBy] = orderDirection;
        }
        return await prisma.charge.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: orderByInput,
        });
    }
}
```

#### Bad:

```typescript
import type { z } from "zod";

// Repository内でドメイン型を定義しない
const billingChargeSchema = z.object({
  amount: z.number(),
  description: z.string(),
});

type BillingCharge = z.infer<typeof billingChargeSchema>;

// Input, Outputの型を定義しない。
type CreateBillingChargeInput = z.infer<typeof billingChargeSchema>;
type CreateBillingChargeOutput = z.infer<typeof billingChargeSchema>;

// 適切に型を処理していれば不要なはずのmap関数を作成してはいけない
const mapBillingChargeToDomain = (charge: CreateBillingChargeOutput): BillingCharge => {
    return {
        id: charge.id,
        amount: charge.amount,
        description: charge.description,
    };
}
// Input型を定義してはいけない
type SearchChargesInput = {
    userId?: string;
    tenantId?: string;
    limit?: number;
    offset?: number;
}

// Output型を定義してはいけない
type SearchChargesOutput = {
    charges: BillingCharge[];
    total: number;
    page: number;
    pageSize: number;
}
// 返り値の型が若干違うだけの型を定義してはいけない。
type SearchChargeAndUserOutput = {
    charge: BillingCharge;
    user: User;
}

class BillingRepositoryPrisma implements BillingRepository {
    // inputの型を定義してはいけない
    // outputの型を定義してはいけない
    async createCharge(input: CreateBillingChargeInput): Promise<CreateBillingChargeOutput> {
        const charge = await prisma.charge.create({
            data: input,
        });
        // map関数を作成してはいけない
        return mapBillingChargeToDomain(charge);
    }
    // 入力にInput型を定義してはいけない
    async searchCharges(input: SearchChargesInput): Promise<SearchChargesOutput> {
        return await prisma.charge.findMany({
            where: input,
            skip: input.offset,
            take: input.limit,
            orderBy: input.orderBy,
        });
    }
    // ほぼ中身が同じで役割が若干違うだけのメソッドを作成してはいけない。
    async searchChargesWithPagination(input: SearchChargesInput): Promise<SearchChargesOutput> {
        const where: Prisma.ChargeWhereInput = {};
        if (input.userId) {
            where.userId = input.userId;
        }
        if (input.tenantId) {
            where.tenantId = input.tenantId;
        }
        return await prisma.charge.findMany({
            where,
            skip: input.offset,
            take: input.limit,
            orderBy: input.orderBy,
        });
    }
    // 返り値の型が若干違うだけのメソッドを作成してはいけない。
    async searchChargeAndUser(input: SearchChargesInput): Promise<SearchChargeAndUserOutput> {
        return await prisma.charge.findFirst({
            where: input,
            include: {
                user: true,
            },
        });
    }
}
```
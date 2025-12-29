# 機能仕様書: [機能名]

機能名: `[feature_number]-[feature_name]`  
作成日: [日付]  
モデル名: [モデル名 ex: Claude 4.5 Sonnet, GPT-5]  
仕様書テンプレートバージョン: 1.0.1

## 概要
<!-- 

提供される機能を1行で簡潔に説明してください。

例: 
再注文を1クリックで行う

 -->
## 要件 *(必須)*

<!--
  要対応: このセクションの内容はプレースホルダーです。
  適切な機能要件で埋めてください。
-->

### 機能実装前後の変更点
#### 機能実装前
<!--
  要対応: このセクションの内容はプレースホルダーです。
  関連部分の実装前の状態を記載してください。
-->
#### 機能実装後
<!--
  要対応: このセクションの内容はプレースホルダーです。
  関連部分の実装後の状態を記載してください。
-->

### 機能要件

- FR-001: システムは[特定の機能、例: "ユーザーがアカウントを作成できる"]を提供しなければならない (implement_set_name)_1
- FR-002: システムは[特定の機能、例: "メールアドレスを検証する"]を提供しなければならない (implement_set_name)_1
- FR-003: ユーザーは[重要な操作、例: "パスワードをリセットする"]ことができなければならない (implement_set_name)_1
- FR-004: システムは[データ要件、例: "ユーザー設定を永続化する"]を満たさなければならない (implement_set_name)_2
- FR-005: システムは[動作、例: "すべてのセキュリティイベントをログに記録する"]を実行しなければならない (implement_set_name)_3

### エンティティ構造

<!--
  要対応: エンティティをどのように変更するかを明記してください。なぜ変更するかなども明記してください。
  変更が必要なエンティティはすべて明記してください。
  将来的に必要なカラムは考慮せず、絶対に必要なカラムのみを明記してください。

-->

<!--
  要対応: diffの形式でエンティティの変更点を明記してください

  例: 
  ```diff
  + model User {
  +   id String @id @default(uuid())
  +   name String
  +   email String @unique
  +   password String
  + }

  model Coupon {
    id String @id @default(uuid())
    name String
    discountType String
    discountAmount Number
    expirationDate Date
  + expirationDate Date
    totalUsage Number
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```
-->

## 成功基準 *(必須)*

<!--
  要対応: 測定可能な成功基準を定義してください。
  これらは技術に依存せず、測定可能である必要があります。
-->

### 型定義 *(新規型が必要な場合に含める)*

<!--
  要対応: 新規に定義が必要な型を明記してください。
  不要な型を作っていないかを注意深く確認してください。
-->

#### Domain固有型 (features/[domain]/types.ts)

- `[TypeName]`: [型の説明と使用箇所]

#### 共通型 (shared/types/types.ts)

- `[TypeName]`: [型の説明と使用箇所]

## 実装手順

<!--
  要対応: 実装手順を定義してください。
  ここではTDDを行い、テストを最初に書き、テストを通すための実装を書き、テストを通したらリファクタリングを行うことを行います。実装セットに分け、実装セット内ではTDDを行います。実装セットはモジュールごとに分け、順に実装を行えばすべての機能が実装できるようにしてください。
  各handlerなど実装は最上部にそのファイルに期待される動きを記載する必要があります。この内容は`// TASK: [実装内容]`というコメントで記載する必要があります。
  各実装セットはエントリーポイントがどのような仕様なのかも明記する。エントリーポイントは一つであることが望ましいが複数も可能。
  DTOは作らない。引数と返り値は明確に型を記載する。
  機能の実現に必要かつ、新規作成は編集が必要なcommand/query/flow/repository/serviceはすべて明記する。
-->

### 実装セット test_helper: テストヘルパー 
<!-- 

  複数箇所で共通のテスト関連機能が必要な場合はここで実装します。このテストヘルパーにより複数箇所で重複するテスト関連機能を実装し、ソースコード量を削減します。
  create~~~などのRepositoryに関わる処理は必ずモックリポジトリではなく、本番リポジトリで実装します。
  initDatabase、removeAllDataFromDatabase以外は必ず、関数名にtestを含むこと。ex: createCoupon→createTestCoupon

  以下のポリシーに従って実装してください。
  - [base_dir]/test/helper.tsはドメインに強く紐づかないテスト関連機能を実装します。
    - 上記に実装すべきテスト関連機能は以下です
      - removeAllDataFromDatabase (すべてのレコードを削除することで、次のテストをクリーンな状態で実行できるようにします。)
        - データベースからすべてのデータを削除します。afterAllで必ず呼び出す必要があります。
      - initDatabase (seedデータの投入などを行い、データベースをあるべき状態にします。)
        - beforeEachで必ず呼び出す必要があります。
    - 各ドメインのあるべきデータを用意する機能はこちらに用意する。DBに直接書き込み、テスト用のデータを作成します。ドメインを特殊な状態にするフラグもつけることで作成方法が複雑なドメインの状態も簡単に再現できるようにします。既存のoperationで十分な場合は作成しない。複雑な処理が必要な場合のみ、関数を追加する。createTestUserWithProdoctのような複数ドメインをまたぐ関数は作成しない。
      - 例: createTestCoupon(
        discountType: string,
        expired: boolean,
      ): Promise<Coupon>
      - 例: createTestUser(
        name: string,
        email: string,
        isAdmin: boolean,
        isBlocked: boolean,
      ): Promise<User>

  - [base_dir]/features/[domain]/test/helper.tsはドメインに強く紐づくテスト関連機能を実装します。絶対にドメイン内のテストに共通するもののみを実装します。他のドメインや、flows内から呼び出す必要があるものはこちらには実装しません。このファイルは無理に実装する必要は無く、必要な場合のみ実装します。


 -->
 {実装内容は必ず記載する。 テストヘルパーが不要な場合はなぜ不要なのかを明記してください。}

- 対象ファイル:
  - `test/helper.ts` (新規追加 or 修正)
  - `test/helper.test.ts` (新規追加 or 修正)

- 実装関数
  - [関数名]([引数]): [返り値] ex: `createTestCoupon(discountType: string, expired: boolean): Promise<Coupon>`
    - 実装内容: [実装内容: ex: DBに直接書き込み、既存のoperationであるcreateCouponではexpiredな状態を再現するには複雑な処理が必要なため、一連の処理をこの関数で行うことでテストファイルの実装量を削減する。]
    - テスト項目: 
      - [テスト項目(itと対応するように記載)]
  {...他にもあれば項目を追加してください。}

- 手順:
<!-- 
手順は上から順に実行すればタスクが完了するようにする。
例:
  - [] [関数名]を実装(test/helper.ts)
  - [] [関数名]のテストを作成(test/helper.test.ts)
  - [] `bun run test test/helper.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。
 -->
  - [] [タスク1]
  - [] [タスク2]

### 実装セット [implementation_set_name]_1: Adapter層 (必要な場合のみ)

<!--

  Repository/Serviceが必要な場合、最初に実装します。

  Port(インターフェース)とAdapter(実装)を含めます。RepositoryのMock実装は作成しません。

-->
#### Repository実装

- 対象ファイル:
  - `prisma/schema.zmodel` (新規追加)
  - `shared/port/[RepositoryName]Repository.ts` (新規追加)
  - `adapter/repository/[RepositoryName]Repository.ts` (新規追加)
- 実装内容: [Repository実装の詳細]
- メソッド:
  - [メソッド名]([引数]): [返り値] ex: `getUser(userId: string): User`
- テスト項目:
  - [テスト項目(itと対応するように記載)]
- 手順:
<!-- 
手順は上から順に実行すればタスクが完了するようにする。例:
実行すべきコマンドは必ず記載する。
例:
  - [] スキーマファイルを更新(prisma/schema.zmodel)
  - [] `bun run prisma generate`を実行し、schema.zmodelを更新
  - [] Port(インターフェース)定義を作成(adapter/port/[RepositoryName]Repository.ts)
  - [] 本番実装を作成(adapter/repository/[RepositoryName]Repository.ts)
  - [] 本番実装のテストを作成(adapter/repository/[RepositoryName]Repository.test.ts)
  - [] `bun run test adapter/repository/[RepositoryName]Repository.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。
  - [] DIコンテナ(shared/container.ts)に登録
  - [] コードスタイルに沿っているか確認し、リファクタリングも合わせて行う。
  - [] リファクタリング後、再度テストを実行し、すべてのテストが通ることを確認
 -->
  - [タスク1]
  - [タスク2]

#### Service実装

- 対象ファイル:
  - `shared/port/[ServiceName]Service.ts` (新規追加)
  - `adapter/service/[ServiceName]Service.ts` (新規追加)
  - `adapter/service/mock/[ServiceName]Service.ts` (新規追加)

- メソッド:
  - [メソッド名]([引数]): [返り値] ex: `sendMessage(channelId: string, message: string): Promise<{ status: 'success' | 'error', messageId: string }>`

- テスト項目:
  - [テスト項目(itと対応するように記載)]

- 実装内容: [Service実装の詳細]

- 手順:
<!-- 
手順は上から順に実行すればタスクが完了するようにする。
実行すべきコマンドは必ず記載する。
例:
  - [] Port(インターフェース)定義を作成(shared/port/[ServiceName]Service.ts)
  - [] 本番実装を作成(adapter/service/[ServiceName]Service.ts)
  - [] 本番実装のテストを作成(adapter/service/[ServiceName]Service.test.ts)
  - [] `bun run test adapter/service/[ServiceName]Service.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。
  - [] Mock実装を作成(adapter/service/mock/[ServiceName]Service.ts)
  - [] Mock実装のテストを作成(adapter/service/mock/[ServiceName]Service.test.ts)
  - [] `bun run test adapter/service/mock/[ServiceName]Service.test.ts`を実行しテストが通ることを確認
  - [] DIコンテナ(shared/container.ts)に登録
  - [] コードスタイルに沿っているか確認し、リファクタリングも合わせて行う。
  - [] リファクタリング後、再度テストを実行し、すべてのテストが通ることを確認
 -->
  - [タスク1]
  - [タスク2]

### 実装セット [implementation_set_name]_2: 型定義 (必要な場合のみ)

<!--
  新規型定義が必要な場合、features/<domain>/types.ts または shared/types/types.ts に定義します。
-->

- 対象ファイル:
  - `features/[domain]/types.ts` (新規追加 or 修正)
  - `shared/types/types.ts` (新規追加 or 修正)

- 実装内容: [型定義の詳細]

- 手順:
<!-- 
手順は上から順に実行すればタスクが完了するようにする。例:
  - [] User型を定義(features/[domain]/types.ts)
 -->
  - [] [タスク1]

### 実装セット [implementation_set_name]_3: [実装セット名] 

<!--
  features/<domain>/command, features/<domain>/query, flows のいずれかの実装セット
  実装セットは1コマンドに対して1つ作成する。「command, query, flow実装」のようにまとめた実装セットは作成せず、「create-todo実装」のように1コマンドに対して1つ作成する。
  このセットのみ以下のように形式が異なることに注意する。
  - command, query, flow実装の場合は必ずエントリーポイントを明記する。
-->

- 対象ファイル: [対象ファイル(複数可能)]
  - エントリーポイント:
    - [新規追加 or 修正: エントリーポイント1]
      - 関数: `[関数名]([引数]): [返り値]` ex: `getUserProfile(userId: string): User`
      - 実装前状態: `[実装前状態]`
      - 実装後状態: `[実装後状態]`
      - 実装内容: `[実装内容]`
      - 使用するPort: `[RepositoryName]Repository`, `[ServiceName]Service` など

- 対象テストファイル: 
  - [対象テストファイル(複数可能)]
    - テスト項目:
    <!-- 
  例:
  - 会員登録済みのユーザーのみクーポンを取得できる
  - 会員登録していないユーザーがクーポンを取得しようとした場合はエラーがthrowされる
  - クーポンが存在しない場合はエラーがthrowされる
  - すでに取得したクーポンを再度取得しようとした場合はエラーがthrowされる
     -->
      - [会員登録済みのユーザーのみクーポンを取得できる]

- 実装内容: [実装内容]
<!-- 
手順は上から順に実行すればタスクが完了するようにする。
RED, GREEN, REFACOTRを意識して実装を行う。ファイル編集が必要な場合は必ずファイル名を例のように記載する。また、テストも項目名を必ず記載する。実行すべきコマンドも全て記載する。

例:
  - [] getUserCouponテストを作成(features/[domain]/command/[CommandName]/handler.test.ts)
    - 会員登録済みのユーザーのみクーポンを取得できる
    - 会員登録していないユーザーがクーポンを取得しようとした場合はエラーがthrowされる
    - クーポンが存在しない場合はエラーがthrowされる
    - すでに取得したクーポンを再度取得しようとした場合はエラーがthrowされる
  - [] getUserCouponを実装(features/[domain]/command/[CommandName]/handler.ts)
  - [] `bun run test features/[domain]/command/[CommandName]/handler.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。
  - [] コードスタイルを参考にしながらリファクタリングを行う(features/[domain]/command/[CommandName]/handler.ts)
  - [] `bun run test features/[domain]/command/[CommandName]/handler.test.ts`を実行しテストが通ることを確認する。テストが通らない場合はエラー内容を確認し、エラー内容に沿って修正を行う。

 -->

  - [] [タスク1]
  - [] [タスク2]
  - [] [タスク3]

### 実装セット [implementation_set_name]_4: UI実装(必要な場合のみ)
<!--
  要対応: UI実装が必要な場合、UI実装を定義してください。
  ここではUI実装を定義してください。UIテストは実装しない。したがってroute以下にテストファイルは作成しない。
-->

- 対象ファイル: [対象ファイル(複数可能)]
  - 実装内容: [実装内容]

  - 手順:
    - [] UI実装(注意: テストは実装しない)

## 影響ページ

<!--
  要対応: 影響ページを定義してください。
  ここでは影響ページを定義してください。
-->

- [影響ページ1] : [どのように影響を受けるか]

## 確認すべき項目
<!--
  要対応: ユーザーが動作確認を行うべき項目を定義してください。
  何を確認するべきか？は実装と同じくらい重要です。ユーザーが漏れなく動作確認し、問題があれば気がつけるように明記してください。
-->

### ローカル確認できる項目
<!--
  要対応: ローカル確認できる項目を定義してください。
  - [項目1]: 
    確認すべき理由: {なぜ確認するべきか？}
    確認すべき内容:{何を確認するべきか？　あるべき状態や、期待する結果を明記してください。}
    確認方法:{どのように確認するべきか？　ローカルでの確認方法を明記してください。}
-->
### デプロイ環境でのみ確認できる項目
<!--
  要対応: デプロイ環境でのみ確認できる項目を定義してください。
  - [項目1]: 
    確認すべき理由: {なぜ確認するべきか？}
    確認すべき内容:{何を確認するべきか？　あるべき状態や、期待する結果を明記してください。}
    確認方法:{どのように確認するべきか？　デプロイ環境での確認方法を明記してください。}
-->
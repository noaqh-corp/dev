# レビュールール

## アーキテクチャ (Architecture)

### [architecture-1] Core、Policy、Portパターンを使わない

**Bad:**
```typescript
// features/hearing-sheet/core/hearing-sheet.ts
export class HearingSheetCore {
  createHearingSheet(input: CreateHearingSheetInput): CreateHearingSheetResult {
    // ...
  }
}

// features/hearing-sheet/policy/hearing-sheet_policy.ts
export class HearingSheetPolicy {
  canCreate(userId: string): boolean {
    // ...
  }
}

// features/hearing-sheet/port/hearingSheetRepository.ts
export interface HearingSheetRepository {
  save(data: HearingSheet): Promise<void>;
}
```

**Good:**
```typescript
// features/hearing-sheet/command/register-hearing-sheet/handler.ts
export async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
  // ... 直接引数で受け取る
): Promise<void> {
  // ...
}
```

**なぜそうするかの理由:**
Core、Policy、Portパターンは以前のアーキテクチャで使用されていましたが、不要な記述が増えるため削除されました。実際、`createHearingSheet`のような大した機能のない関数が作られる原因となります。シンプルにhandler.tsに直接実装することで、コードの可読性と保守性が向上します。

---

## 型定義 (Type Definitions)

### [types-1] Input/Output型を作らない

**Bad:**
```typescript
interface CreateHearingSheetInput {
  userId: string;
  consultationCategory: string;
  // ...
}

interface CreateHearingSheetResult {
  hearingSheetId: string;
  // ...
}

async function createHearingSheet(input: CreateHearingSheetInput): Promise<CreateHearingSheetResult> {
  // ...
}
```

**Good:**
```typescript
async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
  // ... 直接引数で受け取る
): Promise<void> {
  // ...
}
```

**なぜそうするかの理由:**
Input/Output型は無駄に型が増えるだけで、引数で直接設定すれば十分です。`input: CreateHearingSheetInput`のようにまとめると、定義先を見ないと何があるのかわからなくなります。直接引数で受け取ることで、関数のシグネチャが明確になり、IDEの補完も効きやすくなります。

---

### [types-2] dataやinputという引数名を使わない

**Bad:**
```typescript
async function createEbayListing(data: CreateEbayListingData): Promise<void> {
  const userId = data.userId;
  const productId = data.productId;
  // ...
}

async function updateHearingSheet(input: UpdateHearingSheetInput): Promise<void> {
  // ...
}
```

**Good:**
```typescript
async function createEbayListing(
  userId: string,
  productId: string,
  accountId: string,
  // ... 直接引数で受け取る
): Promise<void> {
  // ...
}
```

**なぜそうするかの理由:**
`data:`や`input:`という引数名は、定義先を見ないと何が含まれているのかわかりません。直接引数で受け取ることで、関数のシグネチャが明確になり、呼び出し側でも何を渡すべきかが一目瞭然になります。

---

### [types-3] nullableな引数を避ける

**Bad:**
```typescript
function scrapeSurugaya(url: string, options?: ScrapeOptions): ScrapedResultItem | null {
  // ...
}
```

**Good:**
```typescript
function scrapeSurugaya(url: string): ScrapedResultItem {
  // エラー時はthrowする
  // ...
}
```

**なぜそうするかの理由:**
nullableな引数は、呼び出し側でnullチェックが必要になり、コードが複雑になります。エラー時は明示的にthrowすることで、エラーハンドリングが明確になります。

---

### [types-4] 型をzodスキーマから生成する

**Bad:**
```typescript
// フロントエンド
const consultationCategory: "love" | "work" | "health" = "love";

// バックエンド
const consultationCategorySchema = z.enum(["love", "work", "health"]);
```

**Good:**
```typescript
// バックエンド
export const consultationCategorySchema = z.enum(["love", "work", "health"]);
export type ConsultationCategory = z.infer<typeof consultationCategorySchema>;

// フロントエンド
import type { ConsultationCategory } from "@/lib/server/features/hearing-sheet/types";
```

**なぜそうするかの理由:**
同じ定義を複数箇所で書くと、一貫性が保てず、変更時に複数箇所を修正する必要があります。zodスキーマから型を生成し、それをフロントエンドでも使用することで、単一の真実の源（Single Source of Truth）を保つことができます。

---

## エラーハンドリング (Error Handling)

### [error-1] 不要なtry-catchを避ける

**Bad:**
```typescript
function processListing(id: string): Listing | null {
  try {
    const listing = getListing(id);
    return listing;
  } catch (error) {
    return null;
  }
}
```

**Good:**
```typescript
function processListing(id: string): Listing {
  const listing = getListing(id);
  // エラー時は上位でキャッチ
  return listing;
}
```

**なぜそうするかの理由:**
try-catchは「一応」入れるのではなく、意図的に入れるべきです。想定内のエラーと想定外のエラーを区別し、想定外のエラーは上位でキャッチする方が適切です。エラーをcatchしてnullで握りつぶすと、デバッグが困難になります。

---

### [error-2] nullではなくエラーをthrowする

**Bad:**
```typescript
function scrapeProduct(url: string): ScrapedResultItem | null {
  try {
    // スクレイピング処理
    return result;
  } catch (error) {
    return null;
  }
}
```

**Good:**
```typescript
function scrapeProduct(url: string): ScrapedResultItem {
  // スクレイピング処理
  // エラー時はthrowする
  if (!result) {
    throw new ScrapeError("Failed to scrape product");
  }
  return result;
}
```

**なぜそうするかの理由:**
nullを返すと、呼び出し側でnullチェックが必要になり、エラーの原因がわかりにくくなります。エラーを明示的にthrowすることで、エラーハンドリングが明確になり、デバッグも容易になります。

---

### [error-3] undefinedを返すのではなくエラーをthrowする

**Bad:**
```typescript
function parsePrice(text: string | null | undefined): number | undefined {
  if (!text) {
    return undefined;
  }
  // ...
}
```

**Good:**
```typescript
function parsePrice(text: string): number {
  if (!text) {
    throw new ParseError("Price text is required");
  }
  // ...
}
```

**なぜそうするかの理由:**
`string | null | undefined`のような型を返すと、呼び出し側で三項演算子を使う必要があり、コードが複雑になります。エラーをthrowすることで、エラーハンドリングが明確になり、コードが簡潔になります。

---

### [error-4] +server.tsと+page.server.tsではtry-catchを基本禁止

**Bad:**
```typescript
// src/routes/api/listings/create/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const result = await ebayService.createListing(accessToken, {...});
    return json({ success: true });
  } catch (err) {
    return error(500, 'Failed to create listing');
  }
}
```

**Good:**
```typescript
// src/routes/api/listings/create/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  const result = await ebayService.createListing(accessToken, {...});
  return json({ success: true });
  // エラー時はSvelteKitのエラーハンドリングに任せる
}
```

**なぜそうするかの理由:**
+server.tsと+page.server.tsでは、意図的なエラーハンドリング以外のtry-catchは不要です。エラーをcatchして単に再スローするだけのtry-catchは無意味です。SvelteKitのエラーハンドリングに任せることで、コードが簡潔になります。

---

### [error-5] エラーメッセージで分岐するのではなくエラー型で分岐する

**Bad:**
```typescript
function handleEbayError(error: Error): string {
  if (error.message.includes('25002')) {
    return 'Item Specificsエラーです';
  }
  if (error.message.includes('25005')) {
    return 'カテゴリIDエラーです';
  }
  return 'エラーが発生しました';
}
```

**Good:**
```typescript
type EbayErrorType =
  | { type: 'INVALID_CATEGORY'; categoryId?: string }
  | { type: 'MISSING_ITEM_SPECIFIC'; categoryId?: string; missingAspect?: string }
  | { type: 'DUPLICATE_LISTING'; existingListingId?: string }
  | { type: 'UNKNOWN'; error: EbayError };

function classifyEbayError(error: EbayError): EbayErrorType {
  if (error.errorId === 25005 && error.domain === 'API_CATALOG') {
    return { type: 'INVALID_CATEGORY', categoryId: error.parameters?.[0]?.value };
  }
  // ...
}

// プレゼンテーション層でエラーメッセージを生成
function createEbayErrorMessage(errorType: EbayErrorType): string {
  switch (errorType.type) {
    case 'INVALID_CATEGORY':
      return `カテゴリIDが無効です: ${errorType.categoryId}`;
    // ...
  }
}
```

**なぜそうするかの理由:**
エラーメッセージの文字列で分岐すると、メッセージが変更されたときに動作しなくなる可能性があります。エラーID、domain、subdomain、parametersなどの構造化された情報でエラーを分類し、エラータイプとして扱うことで、より堅牢なエラーハンドリングが可能になります。

---

### [error-6] エラーメッセージ生成はプレゼンテーション層で行う

**Bad:**
```typescript
// src/lib/server/adapter/service/ebayService.ts
async function createListing(...): Promise<void> {
  try {
    // ...
  } catch (error) {
    const userFriendlyMessage = createUserFriendlyErrorMessage(error);
    throw new Error(userFriendlyMessage);
  }
}
```

**Good:**
```typescript
// src/lib/server/adapter/service/ebayService.ts
async function createListing(...): Promise<void> {
  // エラータイプをthrow
  const errorType = classifyEbayError(error);
  throw new EbayErrorException(errorType, error);
}

// src/routes/api/listings/create/+server.ts（プレゼンテーション層）
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    await ebayService.createListing(...);
  } catch (err) {
    if (err instanceof EbayErrorException) {
      const errorMessage = createEbayErrorMessage(err.errorType);
      return error(400, errorMessage);
    }
    throw err;
  }
}
```

**なぜそうするかの理由:**
エラーメッセージの生成はプレゼンテーション層（+server.ts、+page.server.ts）の責務です。サービス層ではエラータイプをthrowし、プレゼンテーション層でユーザーフレンドリーなメッセージに変換することで、責務が明確になります。

---

## テスト (Testing)

### [testing-1] Repositoryのモックは作成しない。


**なぜそうするかの理由:**
モックは実際の動作と異なる可能性があり、本番環境で問題が発生する可能性があります。実際の動作を確認でき、より信頼性の高いテストになります。

---

### [testing-2] if文の中にexpectを書かない

**Bad:**
```typescript
test("scrape surugaya", () => {
  const result = scrapeSurugaya(url);
  if (result) {
    expect(result.price).toBe(1000);
  }
});
```

**Good:**
```typescript
test("scrape surugaya", () => {
  const result = scrapeSurugaya(url);
  expect(result).toBeDefined();
  expect(result.price).toBe(1000);
});
```

**なぜそうするかの理由:**
if文の中にexpectを書くと、条件が満たされない場合にテストが通ってしまう可能性があります。expectは常に実行されるようにし、エラー時はthrowするようにします。

---

### [testing-3] テストユーティリティを共通化する

**Bad:**
```typescript
// surugaya.test.ts
const createMockHtml = () => { /* ... */ };

// rakuma.test.ts
const createMockHtml = () => { /* ... */ };
```

**Good:**
```typescript
// tests/util.ts
export function createMockHtml() {
  // ...
}

// surugaya.test.ts
import { createMockHtml } from "../tests/util";
```

**なぜそうするかの理由:**
同じユーティリティ関数を複数のテストファイルで定義すると、重複が発生し、メンテナンスが困難になります。共通の`tests/util.ts`にまとめることで、再利用性が向上し、変更時の影響範囲が明確になります。

---

### [testing-4] 様々なパターンのテストを書く

**Bad:**
```typescript
test("parse product title", () => {
  const result = normalizeProductTitle("商品名");
  expect(result).toBe("商品名");
});
```

**Good:**
```typescript
test("parse product title - normal case", () => {
  const result = normalizeProductTitle("商品名");
  expect(result).toBe("商品名");
});

test("parse product title - with extra spaces", () => {
  const result = normalizeProductTitle("  商品名  ");
  expect(result).toBe("商品名");
});

test("parse product title - with special characters", () => {
  const result = normalizeProductTitle("商品名【新品】");
  expect(result).toBe("商品名");
});
```

**なぜそうするかの理由:**
様々な形式でデータが入ってくることが想定され、将来的に追加される可能性が高い場合、複数のパターンでテストを書くことで、堅牢性が向上します。

---

## コードの簡潔性 (Code Simplicity)

### [simplicity-1] 行数を削減する

**Bad:**
```typescript
async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
): Promise<HearingSheet> {
  const hearingSheet = {
    id: generateId(),
    userId: userId,
    consultationCategory: consultationCategory,
    createdAt: new Date(),
    updatedAt: new Date(),
    // ... 多くのフィールド
  };
  
  const savedHearingSheet = await repository.save(hearingSheet);
  return savedHearingSheet;
}
```

**Good:**
```typescript
async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
): Promise<void> {
  await repository.save({
    userId,
    consultationCategory,
    createdAt: new Date(),
  });
}
```

**なぜそうするかの理由:**
同じ動作をするなら行数が少ないことが望ましい。

---

### [simplicity-2] 重複定義を避ける

**Bad:**
```typescript
// types.ts
export const registerHearingSheetSchema = z.object({
  consultationCategory: z.enum(["love", "work", "health"]),
  // ...
});

// handler.ts
const registerHearingSheetInputSchema = z.object({
  consultationCategory: z.enum(["love", "work", "health"]),
  // ...
});
```

**Good:**
```typescript
// types.ts
export const registerHearingSheetSchema = z.object({
  consultationCategory: z.enum(["love", "work", "health"]),
  // ...
});

// handler.ts
import { registerHearingSheetSchema } from "../types";
```

**なぜそうするかの理由:**
同じ定義を複数箇所で書くと、変更時に複数箇所を修正する必要があり、一貫性が保てません。一箇所で定義し、それを再利用することで、メンテナンス性が向上します。

---

### [simplicity-3] 不要なコードを削除する

**Bad:**
```typescript
function createListing(id: string): void {
  try {
    const listing = getListing(id);
    // 使用されていない
  } catch (error) {
    // エラーを握りつぶす
  }
  
  // 動作確認用の関数（本番では不要）
  function debugListing() {
    console.log("debug");
  }
}
```

**Good:**
```typescript
function createListing(id: string): void {
  // 必要な処理のみ
}
```

**なぜそうするかの理由:**
不要なコードや動作確認用の関数は、コードベースを複雑にし、メンテナンスを困難にします。必要な処理のみを残すことで、コードの可読性と保守性が向上します。

---

### [simplicity-4] 過度なフォールバックを避ける

**Bad:**
```typescript
// src/routes/listings/+page.server.ts
const productName = domesticInventory?.productName || listing.title;
const productImage = domesticInventory?.imageUrl || '/test.png';
const sourceSite = domesticInventory?.supplierSite || 'unknown';
const ebayStatus = statusMap[listing.status] || listing.status;
```

**Good:**
```typescript
// src/routes/listings/+page.server.ts
if (!domesticInventory?.productName) {
  throw new Error('productName is required');
}
const productName = domesticInventory.productName;

if (!domesticInventory?.imageUrl) {
  throw new Error('imageUrl is required');
}
const productImage = domesticInventory.imageUrl;
```

**なぜそうするかの理由:**
過度なフォールバックは、データの整合性を損ない、デバッグを困難にします。データが作成できないならエラーになるべきです。データが作成できているなら、フォールバックは不要です。

---

### [simplicity-5] 早期returnを使用してネストを減らす

**Bad:**
```typescript
async function syncEbayListings(userId: string): Promise<void> {
  const account = await getEbayAccount(userId);
  if (account) {
    const accessToken = await refreshAccessTokenIfNeeded(account);
    if (accessToken) {
      const offers = await ebayService.getOffers(accessToken);
      if (offers.length > 0) {
        // 処理
      }
    }
  }
}
```

**Good:**
```typescript
async function syncEbayListings(userId: string): Promise<void> {
  const account = await getEbayAccount(userId);
  if (!account) {
    return;
  }

  const accessToken = await refreshAccessTokenIfNeeded(account);
  if (!accessToken) {
    return;
  }

  const offers = await ebayService.getOffers(accessToken);
  if (offers.length === 0) {
    return;
  }

  // 処理
}
```

**なぜそうするかの理由:**
if文のネストが深くなると、コードの可読性が低下します。早期returnを使用することで、ネストを減らし、コードの可読性が向上します。if文のネストは2階層までに抑えるべきです。

---

## 命名 (Naming)

### [naming-1] 意図が明確な変数名を使う

**Bad:**
```typescript
function deleteListing(id: string): void {
  // idが何のidかわからない
}

function processData(data: unknown): void {
  // dataが何かわからない
}
```

**Good:**
```typescript
function removeEbayListing(ebayListingId: string): void {
  // ebayListingIdであることが明確
}

function processScrapedResult(result: ScrapedResultItem): void {
  // ScrapedResultItemであることが明確
}
```

**なぜそうするかの理由:**
`id`や`data`のような曖昧な名前は、何を指しているのかわかりません。`ebayListingId`や`ScrapedResultItem`のように、意図が明確な名前を使うことで、コードの可読性が向上します。

---

### [naming-2] 関数名と処理内容を一致させる

**Bad:**
```typescript
function authenticateApi(req: Request): User | null {
  // API認証とadmin認証の両方を行っている
  if (isAdmin(req)) {
    return authenticateAdmin(req);
  }
  return authenticateApi(req);
}
```

**Good:**
```typescript
function authenticateApi(req: Request): User {
  // API認証のみ
  // ...
}

function authenticateAdmin(req: Request): User {
  // admin認証のみ
  // ...
}

// +server.tsで要件に応じて呼び分ける
if (isAdmin(req)) {
  return authenticateAdmin(req);
}
return authenticateApi(req);
```

**なぜそうするかの理由:**
関数名と処理内容が一致していないと、呼び出し側で混乱が生じます。関数を分けることで、各関数の責務が明確になり、テストも容易になります。

---

### [naming-3] ドメインに適した命名を使う

**Bad:**
```typescript
// features/ebay/command/delete-ebay-listing/handler.ts
async function deleteEbayListing(id: string): Promise<void> {
  // ...
}
```

**Good:**
```typescript
// features/ebay/command/remove-ebay-listing/handler.ts
async function removeEbayListing(id: string): Promise<void> {
  // ...
}
```

**なぜそうするかの理由:**
`delete`はシステム寄りの言葉で、ドメインの概念を表現するには適していません。`remove`のように、ドメインに適した言葉を使うことで、コードがより自然になります。

---

## リポジトリ設計 (Repository Design)

### [repository-1] リポジトリを統合する

**Bad:**
```typescript
// ebayListingRepository.ts
export class EbayListingRepository {
  async getById(id: string): Promise<EbayListing> {
    // ...
  }
}

// listingProductRepository.ts
export class ListingProductRepository {
  async getById(id: string): Promise<ListingProduct> {
    // ...
  }
}

// domesticInventoryRepository.ts
export class DomesticInventoryRepository {
  async getById(id: string): Promise<DomesticInventory> {
    // ...
  }
}
```

**Good:**
```typescript
// productRepository.ts
export class ProductRepository {
  async getListingProduct(id: string): Promise<{
    ebayListing?: EbayListing;
    domesticInventory?: DomesticInventory;
  }> {
    // ebayListingもdomesticInventoryも取得できる
  }
}
```

**なぜそうするかの理由:**
関連するリポジトリを統合することで、コードの重複が減り、関連データを一度に取得できるようになります。`getListingProduct`でebayListingもdomesticInventoryも取得できるようにすることで、呼び出し側のコードが簡潔になります。

---

### [repository-2] 引数と返り値をシンプルにする

**Bad:**
```typescript
function parsePrice(
  text: string | number | null | undefined
): number | string | null | undefined {
  // 様々な型を受け取り、様々な型を返す
}
```

**Good:**
```typescript
function parsePrice(text: string): number {
  // stringを受け取り、numberを返す
  // 変換できなかったらerrorをthrow
  const price = Number(text);
  if (isNaN(price)) {
    throw new ParseError(`Invalid price: ${text}`);
  }
  return price;
}
```

**なぜそうするかの理由:**
引数と返り値の自由度が高すぎると、呼び出し側で型チェックが必要になり、コードが複雑になります。シンプルな型に統一し、エラー時はthrowすることで、コードが簡潔になります。

---

### [repository-3] create、update、delete操作は必ずRepository経由で行う

**Bad:**
```typescript
// src/routes/api/listings/[id]/status/+server.ts（update）
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { status } = await request.json();
  await prisma.ebayListing.update({
    where: { id: params.id },
    data: { status }
  });
}

// src/routes/api/listings/create/+server.ts（create）
export const POST: RequestHandler = async ({ request, locals }) => {
  const { title, price } = await request.json();
  await prisma.ebayListing.create({
    data: { title, price, userId: session.user.id }
  });
}

// src/routes/api/ebay/accounts/[id]/+server.ts（delete）
export const DELETE: RequestHandler = async ({ params, locals }) => {
  await prisma.account.delete({
    where: { id: params.id }
  });
}
```

**Good:**
```typescript
// src/routes/api/listings/[id]/status/+server.ts（update）
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { status } = await request.json();
  const productRepository = Container.getProductRepository();
  await productRepository.updateEbayListing(params.id, undefined, undefined, status);
}

// src/routes/api/listings/create/+server.ts（create）
export const POST: RequestHandler = async ({ request, locals }) => {
  const { title, price } = await request.json();
  const productRepository = Container.getProductRepository();
  await productRepository.createListingForEbayPosting(
    session.user.id,
    accountId,
    title,
    price
  );
}

// src/routes/api/ebay/accounts/[id]/+server.ts（delete）
export const DELETE: RequestHandler = async ({ params, locals }) => {
  const accountRepository = Container.getAccountRepository();
  await accountRepository.deleteAccount(params.id);
}
```

**なぜそうするかの理由:**
create、update、delete操作を直接prismaで行うと、データアクセスロジックが散在し、テストが困難になります。Repository経由で行うことで、データアクセスロジックが集約され、モックによるテストが容易になります。また、複雑なビジネスロジック（トランザクション処理など）をRepositoryに隠蔽できます。

---

### [repository-4] +server.tsと+page.server.tsではprismaに直接依存しない

**Bad:**
```typescript
// src/routes/api/ebay/accounts/+server.ts
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals }) => {
  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id }
  });
}
```

**Good:**
```typescript
// src/routes/api/ebay/accounts/+server.ts
import { Container } from '$lib/server/shared/container';

export const GET: RequestHandler = async ({ locals }) => {
  const accountRepository = Container.getAccountRepository();
  const accounts = await accountRepository.listAccounts(session.user.id);
}
```

**なぜそうするかの理由:**
+server.tsと+page.server.tsでprismaに直接依存すると、データアクセスロジックが散在し、テストが困難になります。Repository経由でアクセスすることで、データアクセスロジックが集約され、モックによるテストが容易になります。

---

### [repository-5] データ取得もRepository経由で行う

**Bad:**
```typescript
// src/lib/server/flow/sync-ebay-listings/handler.ts
async function syncEbayListings(userId: string): Promise<void> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'ebay' }
  });
}
```

**Good:**
```typescript
// src/lib/server/flow/sync-ebay-listings/handler.ts
async function syncEbayListings(userId: string): Promise<void> {
  const accountRepository = Container.getAccountRepository();
  const account = await accountRepository.getEbayAccount(userId);
}
```

**なぜそうするかの理由:**
データ取得もRepository経由で行うことで、データアクセスロジックが集約され、複雑なクエリロジックをRepositoryに隠蔽できます。また、モックによるテストが容易になります。

---

## データベース設計 (Database Design)

### [database-1] 不要なカラムを削除する

**Bad:**
```prisma
model CommandLock {
  id        String   @id @default(uuid())
  tenantId  String
  processId String?
  userId    String
  expiresAt DateTime
  releasedAt DateTime?
  // ...
}
```

**Good:**
```prisma
model CommandLock {
  id     String   @id @default(uuid())
  userId String
  // expiresAtはコード上で計算
  // releasedAtは完了したらレコード削除
}
```

**なぜそうするかの理由:**
カラムが多すぎると、データベースのサイズが増え、クエリが複雑になります。`expiresAt`はコード上で計算でき、`releasedAt`は完了したらレコードを削除すればよいため、DBに保存する必要はありません。

---

### [database-2] 必須項目を明確にする

**Bad:**
```prisma
model EbayListing {
  id              String   @id @default(uuid())
  supplierSiteId  String?
  price           Int?     @default(0)
  lastSyncedAt    DateTime?
  // ...
}
```

**Good:**
```prisma
model EbayListing {
  id             String   @id @default(uuid())
  supplierSiteId String   // 必須
  price          Int      // 必須、デフォルトなし
  // lastSyncedAtは不要
}
```

**なぜそうするかの理由:**
任意の項目が多すぎると、データの整合性が保てません。必須で良さそうな項目は必須にし、`String?`ではなく`String`にすることで、データの整合性が向上します。

---

### [database-3] 計算可能な値はDBに保存しない

**Bad:**
```prisma
model CommandLock {
  id        String   @id @default(uuid())
  userId    String
  expiresAt DateTime // DBに保存
}
```

**Good:**
```typescript
// コード上で計算
function createLock(userId: string): CommandLock {
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
  return {
    userId,
    expiresAt, // メモリ上で計算
  };
}
```

**なぜそうするかの理由:**
`expiresAt`のような計算可能な値は、コード上で計算すれば十分です。DBに保存すると、データの整合性を保つために複雑なロジックが必要になります。

---

### [database-4] 開発サーバー起動時に毎回マイグレーションとシードを実行しない

**Bad:**
```bash
# scripts/dev-server.sh
echo "Database initialization..."
bun run db:generate
bun run db:deploy
bun run db:seed
```

**Good:**
```bash
# scripts/dev-server.sh
# データベースが初期化されているか確認
if is_database_initialized; then
	echo "Database is already initialized."
	# マイグレーション状態を確認
	if check_migration_status; then
		echo "All migrations are up to date."
	else
		echo "Applying pending migrations..."
		bun run db:deploy
	fi
else
	echo "Database is not initialized. Running initial setup..."
	bun run db:deploy
	bun run db:seed
fi
```

**なぜそうするかの理由:**
開発サーバー起動のたびに`db:deploy`と`db:seed`を無条件で実行すると、既存のデータ（eBayアカウントや出品データなど）が失われる可能性があります。データベース初期化状態とマイグレーション状態を確認し、必要な場合のみ実行することで、既存データを保護できます。

---

### [database-5] ロールバック済みの古いマイグレーションを削除する

**Bad:**
```sql
-- _prisma_migrationsテーブルにロールバック済みのマイグレーションが残っている
SELECT migration_name, rolled_back_at FROM _prisma_migrations WHERE rolled_back_at IS NOT NULL;
-- 複数のロールバック済みレコードが残っている
```

**Good:**
```sql
-- ロールバック済みのマイグレーションを削除
DELETE FROM _prisma_migrations WHERE rolled_back_at IS NOT NULL;
```

**なぜそうするかの理由:**
ロールバック済みのマイグレーションが`_prisma_migrations`テーブルに残っていると、マイグレーション履歴が複雑になり、管理が困難になります。ロールバック済みのレコードは不要なので、定期的に削除することで、マイグレーション履歴をクリーンに保つことができます。

---

## フロントエンドとバックエンドの分離 (Frontend-Backend Separation)

### [separation-1] バックエンドでフロントエンドの都合を扱わない

**Bad:**
```typescript
// handler.ts
async function saveHearingSheet(
  userId: string,
  page1Data: { consultationCategory: string },
  page2Data: { gender: string },
): Promise<HearingSheet> {
  // page1、page2はフロントエンドの都合
}
```

**Good:**
```typescript
// handler.ts
async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
  gender: string,
  // ... ドメインの概念で受け取る
): Promise<void> {
  // フロントエンドの都合を意識しない
}

// +page.server.ts（プレゼンテーション層）
export async function submitHearingSheet(
  userId: string,
  consultationCategory: string,
  gender: string,
) {
  
  await registerHearingSheet(
    userId,
    consultationCategory,
    gender,
  );
}
```

**なぜそうするかの理由:**
`page1`や`page2`はフロントエンドの都合であり、バックエンドで扱うべきではありません。handler.tsの引数はフロントエンドの実装を意識すべきではなく、各処理に適切な形でデータを変換するのはプレゼンテーション層（APIや+page.server.ts）の役割です。

---

### [separation-2] ページ遷移を伴うデータ取得は+page.server.tsで行う

**Bad:**
```typescript
// src/routes/listings/new/+page.svelte
onMount(async () => {
  const accountsResponse = await fetch('/api/ebay/accounts');
  const accounts = await accountsResponse.json();
  // ...
});
```

**Good:**
```typescript
// src/routes/listings/new/+page.server.ts
export const load: PageServerLoad = async (event) => {
  const accountRepository = Container.getAccountRepository();
  const accounts = await accountRepository.listAccounts(session.user.id);
  return { accounts };
}

// src/routes/listings/new/+page.svelte
let { data }: { data: PageData } = $props();
let accounts = $state(data.accounts || []);
```

**なぜそうするかの理由:**
ページ遷移を伴うデータ取得は+page.server.tsで行うことで、サーバーサイドでデータを取得でき、SEOにも有利です。また、クライアントサイドでのfetch呼び出しが減り、コードが簡潔になります。動的な取得が必要な場合（アカウント選択時など）のみAPIエンドポイントを使用します。

---

## ミューテーション処理 (Mutation)

### [mutation-1] ミューテーション処理ではシンプルな値のみを返す

**Bad:**
```typescript
async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
): Promise<{
    hearingSheet: HearingSheet;
    success: boolean;
    message: string;
}> {
  const hearingSheet = await repository.save({ /* ... */ });
  return {
    hearingSheet,
    success: true,
    message: "success",
  };
}
```

**Good:**
```typescript
async function registerHearingSheet(
  userId: string,
  consultationCategory: string,
): Promise<HearingSheet> {
  return await repository.save({ /* ... */ });
}
```

**なぜそうするかの理由:**
ミューテーション処理ではできるだけシンプルな値のみを返すことで、コードが簡潔になります。

---

## その他 (Miscellaneous)

### [misc-1] 環境変数は必須チェック関数を使う

**Bad:**
```typescript
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY is required");
}
```

**Good:**
```typescript
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const apiKey = getRequiredEnvVar("API_KEY");
```

**なぜそうするかの理由:**
環境変数から値を取得するたびにifでnullチェックを書くと、コードが冗長になります。`getRequiredEnvVar`のような関数をutils/env.tsに作ることで、コードが簡潔になり、一貫性が保てます。

---

### [misc-2] 後方互換性のための処理を入れない

**Bad:**
```typescript
function normalizeProductTitle(title: string | null | undefined): string {
  // 後方互換性のため
  if (title === null || title === undefined) {
    return "";
  }
  return title.trim();
}
```

**Good:**
```typescript
function normalizeProductTitle(title: string): string {
  return title.trim();
}

// 依存元を適切に移行する
```

**なぜそうするかの理由:**
後方互換性のための処理を入れると、コードが複雑になります。依存元を適切に移行することで、コードが簡潔になり、メンテナンスが容易になります。

---

### [misc-3] デフォルト値を引数に書かない

**Bad:**
```typescript
function scrapeProduct(
  url: string,
  options: ScrapeOptions = { timeout: 5000 }
): ScrapedResultItem {
  // ...
}
```

**Good:**
```typescript
function scrapeProduct(
  url: string,
  timeout: number
): ScrapedResultItem {
  // デフォルト値は呼び出し側で指定
  // ...
}

// 呼び出し側
scrapeProduct(url, 5000);
```

**なぜそうするかの理由:**
デフォルト値を引数に書くと、ロジックが違うところに書かれているのと同じです。呼び出し側で明示的に指定することで、コードの意図が明確になります。

---

### [misc-4] 動作確認用の関数を残さない

**Bad:**
```typescript
function scrapeSurugaya(url: string): ScrapedResultItem {
  // ...
}

// 動作確認用（本番では不要）
function debugScrape() {
  console.log("debug");
}
```

**Good:**
```typescript
function scrapeSurugaya(url: string): ScrapedResultItem {
  // ...
}
```

**なぜそうするかの理由:**
動作確認用の関数は、コードベースを複雑にし、メンテナンスを困難にします。必要な処理のみを残すことで、コードの可読性と保守性が向上します。

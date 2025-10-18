以下の観点(check)でレビューし、templateに従い、結果を報告しなさい。コード編集はせず、報告のみを行いなさい。[テスト修正]

<check>

### **変数 (Variables)**

#### [variables-1] 意味のある、発音しやすい変数名を使う

**Bad:**
```javascript
const yyyymmdstr = moment().format("YYYY/MM/DD");
```

**Good:**
```javascript
const currentDate = moment().format("YYYY/MM/DD");
```

**なぜそうするかの理由:**
`yyyymmdstr`のような変数は、何を意味しているのか一見して理解しにくく、口頭で伝える際も発音しづらいです。一方、`currentDate`は「現在の日付」であることが明確にわかり、コードを読む人やチームメンバーとのコミュニケーションを円滑にします。コードは書く時間よりも読まれる時間の方が圧倒的に長いため、可読性は非常に重要です。

---

#### [variables-2] 同じ種類の変数には同じ語彙を使う

**Bad:**
```javascript
getUserInfo();
getClientData();
getCustomerRecord();
```

**Good:**
```javascript
getUser();
```

**なぜそうするかの理由:**
`Info`, `Data`, `Record`のように、同じ概念（この場合はユーザー情報）に対して異なる単語を使うと、APIの利用者はそれぞれの違いが何であるかを推測する必要が生じ、混乱を招きます。語彙を統一することで、コードベース全体の一貫性が保たれ、開発者は関数の役割を予測しやすくなります。これにより、コードの理解が早まり、バグの発生を防ぐことにも繋がります。

---

#### [variables-3] 検索しやすい名前を使う

**Bad:**
```javascript
// What the heck is 86400000 for?
setTimeout(blastOff, 86400000);
```

**Good:**
```javascript
// Declare them as capitalized named constants.
const MILLISECONDS_PER_DAY = 60 * 60 * 24 * 1000; //86400000;

setTimeout(blastOff, MILLISECONDS_PER_DAY);
```

**なぜそうするかの理由:**
`86400000`のような具体的な数値（マジックナンバー）は、コードを読んだだけではその意味が全く分かりません。また、後からこの値が使われている箇所をコードベース全体から検索しようとしても、ただの数字であるため非常に困難です。`MILLISECONDS_PER_DAY`のように意味のある定数名を与えることで、コードの意図が明確になり（自己文書化）、検索も容易になります。これにより、将来のメンテナンスやリファクタリングが格段に行いやすくなります。

---

#### [variables-4] 説明的な変数を使う

**Bad:**
```javascript
const address = "One Infinite Loop, Cupertino 95014";
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
saveCityZipCode(
  address.match(cityZipCodeRegex)[1],
  address.match(cityZipCodeRegex)[2]
);
```

**Good:**
```javascript
const address = "One Infinite Loop, Cupertino 95014";
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
const [_, city, zipCode] = address.match(cityZipCodeRegex) || [];
saveCityZipCode(city, zipCode);
```

**なぜそうするかの理由:**
Badの例では、`address.match(cityZipCodeRegex)`の結果が配列のどのインデックスに何の情報が入っているのかを読み手が理解する必要があります。これはコードの可読性を著しく下げます。Goodの例のように、分割代入を使って`city`や`zipCode`といった説明的な変数に値を格納することで、`saveCityZipCode`関数に渡される値が何であるかが一目瞭然になります。これにより、コードの意図が明確になり、間違いが起こりにくくなります。

---

#### [variables-5] 頭の中での変換（メンタルマッピング）を避ける

**Bad:**
```javascript
const locations = ["Austin", "New York", "San Francisco"];
locations.forEach(l => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  // Wait, what is `l` for again?
  dispatch(l);
});
```

**Good:**```javascript
const locations = ["Austin", "New York", "San Francisco"];
locations.forEach(location => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  dispatch(location);
});
```

**なぜそうするかの理由:**
`l`のような短い一文字の変数は、ループ処理のスコープが大きくなると、その変数が何を指しているのかを思い出すためにコードを遡る必要が出てきます。これは読み手の認知的な負荷を増やし、バグの原因となります。「`l`は`location`の略」というような、読み手の頭の中での変換（メンタルマッピング）を強制するのではなく、`location`のように明確な名前を使うべきです。明示的なコードは、暗黙的なコードよりも常に優れています。

---

#### [variables-6] 不要なコンテキストを追加しない

**Bad:**
```javascript
const Car = {
  carMake: "Honda",
  carModel: "Accord",
  carColor: "Blue"
};

function paintCar(car, color) {
  car.carColor = color;
}
```

**Good:**
```javascript
const Car = {
  make: "Honda",
  model: "Accord",
  color: "Blue"
};

function paintCar(car, color) {
  car.color = color;
}
```

**なぜそうするかの理由:**
オブジェクト名が`Car`である時点で、そのプロパティが車に関するものであることは明らかです。それにもかかわらず、`carMake`や`carModel`のように変数名に`car`というコンテキストを繰り返し含めるのは冗長です。`make`, `model`, `color`のように、オブジェクト名から推測できるコンテキストを省略することで、コードがより簡潔で読みやすくなります。

---

#### [variables-7] デフォルトパラメータを使い、ショートサーキットや条件分岐を避ける

**Bad:**
```javascript
function createMicrobrewery(name) {
  const breweryName = name || "Hipster Brew Co.";
  // ...
}
```

**Good:**
```javascript
function createMicrobrewery(name = "Hipster Brew Co.") {
  // ...
}
```

**なぜそうするかの理由:**
ES6で導入されたデフォルトパラメータは、関数に値が渡されなかった（`undefined`だった）場合のデフォルト値を設定するための、よりクリーンで宣言的な方法です。`name || "デフォルト値"`というショートサーキット評価は、`''`（空文字）や`0`、`false`といった「falsy」な値が意図せずデフォルト値に置き換えられてしまう可能性があるという問題も抱えています。デフォルトパラメータ構文は、引数が`undefined`の場合にのみ適用されるため、より意図が明確で安全です。

---

### **型 (Types)**

#### [types-1] 無意味な型を作らない

**Bad:**
```typescript
import type { SendDocumentInput } from "$lib/server/types/sendDocument"

export async function sendDocument(input: SendDocumentInput) {
  const repo = Container.getDraftDocumentRepository()
  const draft = await repo.findDraft(input.draftId)
  if (!draft) throw new Error("Draft not found")
  return repo.markAsSent(draft, input)
}
```

**Good:**
```typescript
export async function sendDocument(draftId: string, sentAt: Date) {
  const repo = Container.getDraftDocumentRepository()
  const draft = await repo.findDraft(draftId)
  if (!draft) throw new Error("Draft not found")
  return repo.markAsSent(draft, { draftId, sentAt })
}
```

**なぜそうするかの理由:**
関数の引数をまとめるためだけに新しい型を定義するのは、不要な抽象化です。特に、その型が1箇所でしか使われない場合、型定義を探す手間が増え、コードの見通しが悪くなります。引数が少数（2-3個程度）であれば、直接引数として受け取る方がシンプルで理解しやすいコードになります。型は、複数箇所で共有される概念や、ドメインモデルとして意味のあるものに対してのみ定義すべきです。単なる引数のグルーピングのための型は、コードベースを複雑にするだけで価値を生みません。

---

### **関数 (Functions)**

#### [functions-1] 関数の引数は理想的には2つ以下にする

**Bad:**
```javascript
function createMenu(title, body, buttonText, cancellable) {
  // ...
}

createMenu("Foo", "Bar", "Baz", true);
```

**Good:**
```javascript
function createMenu({ title, body, buttonText, cancellable }) {
  // ...
}

createMenu({
  title: "Foo",
  body: "Bar",
  buttonText: "Baz",
  cancellable: true
});
```

**なぜそうするかの理由:**
関数の引数が増えるほど、テストの組み合わせが爆発的に増加し、関数を正しく使うのが難しくなります。特に3つを超えると、呼び出し側で引数の順番を間違えるリスクが高まります。オブジェクトと分割代入を使うことで、引数に名前を付けたかのように扱うことができ、順番を気にする必要がなくなります。また、関数のシグネチャを見るだけで、どのようなプロパティが期待されているかが一目瞭然になります。これにより、可読性が向上し、副作用を防ぎやすくなるなどの利点があります。

---

#### [functions-2] 関数は一つのことだけを行うべき

**Bad:**
```javascript
function emailClients(clients) {
  clients.forEach(client => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);
    }
  });
}
```

**Good:**
```javascript
function emailActiveClients(clients) {
  clients.filter(isActiveClient).forEach(email);
}

function isActiveClient(client) {
  const clientRecord = database.lookup(client);
  return clientRecord.isActive();
}
```

**なぜそうするかの理由:**
これはソフトウェア工学で最も重要なルールです。Badの例では、「クライアントのリストをループする」「アクティブかどうかを判定する」「メールを送信する」という複数の責務を一つの関数が担っています。これにより、テストがしにくく、再利用も困難になります。Goodの例のように、責務ごとに関数を分割することで、各関数はよりテストしやすく、再利用可能になり、コード全体の可読性が劇的に向上します。

---

#### [functions-3] 関数名はその関数が何をするかを表すべき

**Bad:**
```javascript
function addToDate(date, month) {
  // ...
}

const date = new Date();

// It's hard to tell from the function name what is added
addToDate(date, 1);
```

**Good:**
```javascript
function addMonthToDate(month, date) {
  // ...
}

const date = new Date();
addMonthToDate(1, date);
```

**なぜそうするかの理由:**
`addToDate`という関数名では、日付に何を追加するのか（日、月、年？）が全く分かりません。これでは、関数を使う側が実装を読まないと正しく使えません。`addMonthToDate`のように、関数名自体がその処理内容を具体的に説明していることで、コードを読む人は実装の詳細を見なくても、その関数が何をするのかを正確に理解できます。

---

#### [functions-4] 関数の抽象レベルは一つに統一する

**Bad:**
```javascript
function parseBetterJSAlternative(code) {
  const REGEXES = [
    // ...
  ];

  const statements = code.split(" ");
  const tokens = [];
  REGEXES.forEach(REGEX => {
    statements.forEach(statement => {
      // ...
    });
  });

  const ast = [];
  tokens.forEach(token => {
    // lex...
  });

  ast.forEach(node => {
    // parse...
  });
}
```

**Good:**
```javascript
function parseBetterJSAlternative(code) {
  const tokens = tokenize(code);
  const syntaxTree = parse(tokens);
  syntaxTree.forEach(node => {
    // parse...
  });
}

function tokenize(code) {
  const REGEXES = [
    // ...
  ];

  const statements = code.split(" ");
  const tokens = [];
  REGEXES.forEach(REGEX => {
    statements.forEach(statement => {
      tokens.push(/* ... */);
    });
  });

  return tokens;
}

function parse(tokens) {
  const syntaxTree = [];
  tokens.forEach(token => {
    syntaxTree.push(/* ... */);
  });

  return syntaxTree;
}
```

**なぜそうするかの理由:**
Badの例では、高レベルの概念（コードのパース）と低レベルの概念（文字列の分割、トークン化）が同じ関数内に混在しています。これにより、関数が長大で複雑になり、理解やテストが困難になります。Goodの例のように、`tokenize`や`parse`といった低レベルの処理を別の関数に切り出すことで、`parseBetterJSAlternative`は高レベルの処理の流れだけを記述するようになります。これにより、各関数が単一の抽象レベルに保たれ、再利用性やテスト容易性が向上します。

---

#### [functions-5] 重複したコードを削除する

**Bad:**
```javascript
function showDeveloperList(developers) {
  developers.forEach(developer => {
    const expectedSalary = developer.calculateExpectedSalary();
    const experience = developer.getExperience();
    const githubLink = developer.getGithubLink();
    const data = {
      expectedSalary,
      experience,
      githubLink
    };

    render(data);
  });
}

function showManagerList(managers) {
  managers.forEach(manager => {
    const expectedSalary = manager.calculateExpectedSalary();
    const experience = manager.getExperience();
    const portfolio = manager.getMBAProjects();
    const data = {
      expectedSalary,
      experience,
      portfolio
    };

    render(data);
  });
}
```

**Good:**
```javascript
function showEmployeeList(employees) {
  employees.forEach(employee => {
    const expectedSalary = employee.calculateExpectedSalary();
    const experience = employee.getExperience();

    const data = {
      expectedSalary,
      experience
    };

    switch (employee.type) {
      case "manager":
        data.portfolio = employee.getMBAProjects();
        break;
      case "developer":
        data.githubLink = employee.getGithubLink();
        break;
    }

    render(data);
  });
}
```

**なぜそうするかの理由:**
重複したコードは、将来ロジックを変更する必要が生じた際に、複数の箇所を修正しなければならなくなるため、バグの温床となります。Badの例では、開発者とマネージャーで共通のロジックがそれぞれの関数に重複して存在しています。Goodの例のように、共通部分を一つの関数にまとめ、異なる部分だけを条件分岐で処理する抽象化を行うことで、コードの重複をなくし、メンテナンス性を大幅に向上させることができます。

---

#### [functions-6] `Object.assign`でデフォルトオブジェクトを設定する

**Bad:**
```javascript
const menuConfig = {
  title: null,
  body: "Bar",
  buttonText: null,
  cancellable: true
};

function createMenu(config) {
  config.title = config.title || "Foo";
  config.body = config.body || "Bar";
  config.buttonText = config.buttonText || "Baz";
  config.cancellable =
    config.cancellable !== undefined ? config.cancellable : true;
}

createMenu(menuConfig);
```

**Good:**
```javascript
const menuConfig = {
  title: "Order",
  // User did not include 'body' key
  buttonText: "Send",
  cancellable: true
};

function createMenu(config) {
  let finalConfig = Object.assign(
    {
      title: "Foo",
      body: "Bar",
      buttonText: "Baz",
      cancellable: true
    },
    config
  );
  return finalConfig
  // config now equals: {title: "Order", body: "Bar", buttonText: "Send", cancellable: true}
  // ...
}

createMenu(menuConfig);
```

**なぜそうするかの理由:**
Badの例のように、プロパティごとにデフォルト値を設定するコードは冗長で、`null`や`undefined`の扱いに注意が必要です。`Object.assign`を使うと、デフォルト値を持つオブジェクトを最初に定義し、それにユーザーが指定した設定オブジェクトをマージすることができます。これにより、コードが簡潔になり、どのプロパティが設定可能で、そのデフォルト値が何であるかが一箇所にまとまるため、非常に見通しが良くなります。

---

#### [functions-7] フラグを関数の引数として使わない

**Bad:**
```javascript
function createFile(name, temp) {
  if (temp) {
    fs.create(`./temp/${name}`);
  } else {
    fs.create(name);
  }
}```

**Good:**
```javascript
function createFile(name) {
  fs.create(name);
}

function createTempFile(name) {
  createFile(`./temp/${name}`);
}
```

**なぜそうするかの理由:**
真偽値のフラグを引数に取る関数は、そのフラグの値によって内部の処理経路が変わることを意味しており、「関数は一つのことだけを行うべき」という原則に違反しています。これは、関数が複数の責任を持っているサインです。Goodの例のように、`createFile`と`createTempFile`というように、それぞれの目的に応じた別々の関数として定義する方が、意図が明確で、呼び出し側も理解しやすくなります。

---

#### [functions-8] 副作用を避ける (パート1)

**Bad:**
```javascript
// Global variable referenced by following function.
// If we had another function that used this name, now it'd be an array and it could break it.
let name = "Ryan McDermott";

function splitIntoFirstAndLastName() {
  name = name.split(" ");
}

splitIntoFirstAndLastName();

console.log(name); // ['Ryan', 'McDermott'];
```

**Good:**```javascript
function splitIntoFirstAndLastName(name) {
  return name.split(" ");
}

const name = "Ryan McDermott";
const newName = splitIntoFirstAndLastName(name);

console.log(name); // 'Ryan McDermott';
console.log(newName); // ['Ryan', 'McDermott'];
```

**なぜそうするかの理由:**
関数が自身のスコープ外にある変数（グローバル変数など）を変更することを「副作用」と呼びます。副作用は、プログラムの動作を予測困難にし、デバッグを非常に難しくします。Badの例では、グローバル変数の`name`が関数によって直接変更されてしまっています。Goodの例のように、関数は受け取った値を元に処理を行い、結果を戻り値として返す「純粋関数」として設計することで、元のデータは変更されず、関数の振る舞いがその入力と出力だけで完結するため、コードの信頼性と再利用性が高まります。

---

#### [functions-9] 副作用を避ける (パート2)

**Bad:**
```javascript
const addItemToCart = (cart, item) => {
  cart.push({ item, date: Date.now() });
};
```

**Good:**
```javascript
const addItemToCart = (cart, item) => {
  return [...cart, { item, date: Date.now() }];
};
```

**なぜそうするかの理由:**
JavaScriptのオブジェクトや配列はミュータブル（変更可能）であるため、関数に渡されたオブジェクトを直接変更すると、予期せぬ副作用を引き起こす可能性があります。Badの例では、渡された`cart`配列自体を変更してしまっています。これにより、この`cart`配列を参照している他の箇所の動作に意図しない影響を与えるかもしれません。Goodの例のように、スプレッド構文などを使って新しい配列を作成し、それを返すことで、元のデータを不変（イミュータブル）に保ちます。これにより、関数の影響範囲が限定され、安全で予測可能なコードになります。

---

#### [functions-10] グローバル関数を書き換えない

**Bad:**
```javascript
Array.prototype.diff = function diff(comparisonArray) {
  const hash = new Set(comparisonArray);
  return this.filter(elem => !hash.has(elem));
};
```

**Good:**
```javascript
class SuperArray extends Array {
  diff(comparisonArray) {
    const hash = new Set(comparisonArray);
    return this.filter(elem => !hash.has(elem));
  }
}
```

**なぜそうするかの理由:**
`Array.prototype`のようなネイティブのオブジェクトを直接拡張する（モンキーパッチ）ことは、他のライブラリとの衝突を引き起こす可能性があるため、非常に危険な行為です。もし他のライブラリも同じ名前のメソッドを定義していた場合、どちらか一方が予期せず上書きされてしまいます。Goodの例のように、ES6のクラス継承を使って`Array`を拡張することで、グローバルな名前空間を汚染することなく、安全に新しい機能を追加できます。

---

#### [functions-11] 命令型プログラミングよりも関数型プログラミングを好む

**Bad:**
```javascript
const programmerOutput = [
  { name: "Uncle Bobby", linesOfCode: 500 },
  { name: "Suzie Q", linesOfCode: 1500 },
  { name: "Jimmy Gosling", linesOfCode: 150 },
  { name: "Gracie Hopper", linesOfCode: 1000 }
];

let totalOutput = 0;

for (let i = 0; i < programmerOutput.length; i++) {
  totalOutput += programmerOutput[i].linesOfCode;
}
```

**Good:**
```javascript
const programmerOutput = [
  { name: "Uncle Bobby", linesOfCode: 500 },
  { name: "Suzie Q", linesOfCode: 1500 },
  { name: "Jimmy Gosling", linesOfCode: 150 },
  { name: "Gracie Hopper", linesOfCode: 1000 }
];

const totalOutput = programmerOutput.reduce(
  (totalLines, output) => totalLines + output.linesOfCode,
  0
);
```

**なぜそうするかの理由:**
命令型（Badの例の`for`ループ）は、「どのように」処理を行うかをステップバイステップで記述します。これは冗長になりがちで、間違いも起こりやすいです。一方、関数型（Goodの例の`reduce`）は、「何を」したいかを宣言的に記述します。`map`, `filter`, `reduce`などの配列メソッドを使うことで、コードはより簡潔で表現力豊かになり、副作用のないクリーンなコードを書きやすくなります。

---

#### [functions-12] 条件式をカプセル化する

**Bad:**```javascript
if (fsm.state === "fetching" && isEmpty(listNode)) {
  // ...
}```

**Good:**
```javascript
function shouldShowSpinner(fsm, listNode) {
  return fsm.state === "fetching" && isEmpty(listNode);
}

if (shouldShowSpinner(fsmInstance, listNodeInstance)) {
  // ...
}
```

**なぜそうするかの理由:**
複雑な条件式が`if`文の中に直接書かれていると、その条件が何を意味しているのかを理解するために、式全体を読み解く必要があります。この条件式を`shouldShowSpinner`のような、その意図を説明する名前の関数にカプセル化することで、`if`文のコードが「もしスピナーを表示すべきなら」と自然言語のように読めるようになります。これにより、コードの可読性が大幅に向上し、ロジックの再利用も可能になります。

---

#### [functions-13] 否定的な条件式を避ける

**Bad:**
```javascript
function isDOMNodeNotPresent(node) {
  // ...
}

if (!isDOMNodeNotPresent(node)) {
  // ...
}
```

**Good:**
```javascript
function isDOMNodePresent(node) {
  // ...
}

if (isDOMNodePresent(node)) {
  // ...
}
```

**なぜそうするかの理由:**
`!isDOMNodeNotPresent`のような二重否定は、人間の脳にとって理解しにくく、読み間違いを引き起こす原因となります。肯定的な条件（`isDOMNodePresent`）を評価する方が、コードの意図がストレートに伝わり、読みやすく、間違いにくいコードになります。真理を評価する方が、偽りを評価するよりも直感的です。

---

#### [functions-14] 条件分岐を避ける

**Bad:**
```javascript
class Airplane {
  // ...
  getCruisingAltitude() {
    switch (this.type) {
      case "777":
        return this.getMaxAltitude() - this.getPassengerCount();
      case "Air Force One":
        return this.getMaxAltitude();
      case "Cessna":
        return this.getMaxAltitude() - this.getFuelExpenditure();
    }
  }
}
```

**Good:**```javascript
class Airplane {
  // ...
}

class Boeing777 extends Airplane {
  // ...
  getCruisingAltitude() {
    return this.getMaxAltitude() - this.getPassengerCount();
  }
}

class AirForceOne extends Airplane {
  // ...
  getCruisingAltitude() {
    return this.getMaxAltitude();
  }
}

class Cessna extends Airplane {
  // ...
  getCruisingAltitude() {
    return this.getMaxAltitude() - this.getFuelExpenditure();
  }
}
```

**なぜそうするかの理由:**
`if`文や`switch`文は、一つの関数が複数の異なることを行っているサインです。これは「関数は一つのことだけを行うべき」という原則に反します。ポリモーフィズム（多態性）を利用して、型（クラス）ごとに振る舞いを定義することで、条件分岐を排除できます。Badの例では、新しい飛行機の種類を追加するたびに`switch`文を修正する必要があります。Goodの例のようにクラスで振る舞いを分離すると、新しい飛行機のクラスを追加するだけで済み、既存のコードを変更する必要がなくなるため、拡張性が高く、より堅牢な設計になります。

---

#### [functions-15] 型チェックを避ける (パート1)

**Bad:**
```javascript
function travelToTexas(vehicle) {
  if (vehicle instanceof Bicycle) {
    vehicle.pedal(this.currentLocation, new Location("texas"));
  } else if (vehicle instanceof Car) {
    vehicle.drive(this.currentLocation, new Location("texas"));
  }
}
```

**Good:**
```javascript
function travelToTexas(vehicle) {
  vehicle.move(this.currentLocation, new Location("texas"));
}
```

**なぜそうするかの理由:**
引数の型によって処理を分岐させるのは、異なる型に対して一貫性のないAPIを公開していることを示しています。これはポリモーフィズムをうまく利用できていない例です。`Bicycle`と`Car`の両方が`move`という共通のインターフェース（メソッド）を持つように設計することで、`travelToTexas`関数は具体的な型を意識する必要がなくなり、より汎用性の高い、クリーンなコードになります。

---

#### [functions-16] 型チェックを避ける (パート2)

**Bad:**
```javascript
function combine(val1, val2) {
  if (
    (typeof val1 === "number" && typeof val2 === "number") ||
    (typeof val1 === "string" && typeof val2 === "string")
  ) {
    return val1 + val2;
  }

  throw new Error("Must be of type String or Number");
}
```

**Good:**
```javascript
function combine(val1, val2) {
  return val1 + val2;
}
```

**なぜそうするかの理由:**
JavaScriptは動的型付け言語であり、その柔軟性を活かすべきです。手動で型チェックを行うコードは冗長になり、可読性を損ないます。型安全性を重視する場合は、TypeScriptのような静的型付けを提供する代替手段を検討すべきです。通常のJavaScriptでは、優れたテストとコードレビューによって品質を担保する方が、コードのクリーンさを保つ上で効果的です。`+`演算子は数値と文字列の両方で自然に動作するため、Goodの例のようにシンプルな実装で十分です。

---

#### [functions-17] 過度な最適化をしない

**Bad:**
```javascript
// On old browsers, each iteration with uncached `list.length` would be costly
// because of `list.length` recomputation. In modern browsers, this is optimized.
for (let i = 0, len = list.length; i < len; i++) {
  // ...
}
```

**Good:**
```javascript
for (let i = 0; i < list.length; i++) {
  // ...
}
```

**なぜそうするかの理由:**
現代のJavaScriptエンジンは非常に高度に最適化されており、開発者が手動で行うマイクロ最適化の多くは不要、あるいは逆効果になることさえあります。Badの例のような`list.length`のキャッシュは、古いブラウザでは有効でしたが、現代ではエンジンが自動的に最適化してくれます。 premature optimization (早すぎる最適化) はコードを複雑にし、可読性を下げるだけです。まずはクリーンで読みやすいコードを書き、パフォーマンスが問題になった場合にのみ、プロファイリングを行ってボトルネックを特定し、そこを対象に最適化を行うべきです。

---

#### [functions-18] 使われていないコード（デッドコード）を削除する

**Bad:**
```javascript
function oldRequestModule(url) {
  // ...
}

function newRequestModule(url) {
  // ...
}

const req = newRequestModule;
inventoryTracker("apples", req, "www.inventory-awesome.io");
```

**Good:**
```javascript
function newRequestModule(url) {
  // ...
}

const req = newRequestModule;
inventoryTracker("apples", req, "www.inventory-awesome.io");
```

**なぜそうするかの理由:**
デッドコードは、もはやプログラムのどこからも呼び出されていないコードのことです。これをコードベースに残しておくと、他の開発者が「これはまだ使われているのかもしれない」と誤解し、無駄な調査時間を費やしたり、保守の対象として考え続けたりすることになります。バージョン管理システム（Gitなど）を使っていれば、削除したコードはいつでも履歴から復元できます。使われていないコードは、混乱を避けるために即座に削除するべきです。

---

### **オブジェクトとデータ構造 (Objects and Data Structures)**

#### [objects-1] ゲッターとセッターを使う

**Bad:**
```javascript
function makeBankAccount() {
  // ...

  return {
    balance: 0
    // ...
  };
}

const account = makeBankAccount();
account.balance = 100;
```

**Good:**
```javascript
function makeBankAccount() {
  // this one is private
  let balance = 0;

  // a "getter", made public via the returned object below
  function getBalance() {
    return balance;
  }

  // a "setter", made public via the returned object below
  function setBalance(amount) {
    // ... validate before updating the balance
    balance = amount;
  }

  return {
    // ...
    getBalance,
    setBalance
  };
}

const account = makeBankAccount();
account.setBalance(100);
```

**なぜそうするかの理由:**
プロパティに直接アクセスするのではなく、ゲッターとセッターのメソッドを通してアクセスすることで、多くの利点が生まれます。
1.  **バリデーション**: `setBalance`内で値の妥当性チェック（例：マイナスの値は設定できないなど）を簡単に追加できます。
2.  **カプセル化**: オブジェクトの内部的なデータ構造（この場合は`balance`変数）を外部から隠蔽できます。
3.  **柔軟性**: 将来、値を取得・設定する際にログ出力やエラーハンドリングなどの追加処理が必要になっても、ゲッター/セッター内を修正するだけで済み、オブジェクトの利用側コードを変更する必要がありません。
4.  **遅延ロード**: データの取得を、サーバーからの非同期通信など、必要になったタイミングで行う実装も可能です。

---

#### [objects-2] オブジェクトはプライベートメンバーを持つべき

**Bad:**
```javascript
const Employee = function(name) {
  this.name = name;
};

Employee.prototype.getName = function getName() {
  return this.name;
};

const employee = new Employee("John Doe");
console.log(`Employee name: ${employee.getName()}`); // Employee name: John Doe
delete employee.name;
console.log(`Employee name: ${employee.getName()}`); // Employee name: undefined
```

**Good:**
```javascript
function makeEmployee(name) {
  return {
    getName() {
      return name;
    }
  };
}

const employee = makeEmployee("John Doe");
console.log(`Employee name: ${employee.getName()}`); // Employee name: John Doe
delete employee.name;
console.log(`Employee name: ${employee.getName()}`); // Employee name: John Doe
```

**なぜそうするかの理由:**
Badの例では、`employee.name`プロパティが外部から直接アクセス可能（public）なため、意図せず変更されたり削除されたりする危険性があります。Goodの例では、クロージャを利用して`name`変数を関数スコープ内に閉じ込めています。これにより、`name`は外部から直接アクセス不可能なプライベートメンバーとなり、公開された`getName`メソッドを通してのみアクセスできます。このカプセル化によって、オブジェクトの状態が意図しない形で変更されることを防ぎ、より堅牢なコードになります。

---

### **クラス (Classes)**

#### [classes-1] ES5の関数よりもES2015/ES6のクラスを優先する

**Bad:**
```javascript
const Animal = function(age) {
  if (!(this instanceof Animal)) {
    throw new Error("Instantiate Animal with `new`");
  }
  this.age = age;
};
Animal.prototype.move = function move() {};
const Mammal = function(age, furColor) {
  if (!(this instanceof Mammal)) {
    throw new Error("Instantiate Mammal with `new`");
  }
  Animal.call(this, age);
  this.furColor = furColor;
};
Mammal.prototype = Object.create(Animal.prototype);
Mammal.prototype.constructor = Mammal;
Mammal.prototype.liveBirth = function liveBirth() {};
const Human = function(age, furColor, languageSpoken) {
  if (!(this instanceof Human)) {
    throw new Error("Instantiate Human with `new`");
  }
  Mammal.call(this, age, furColor);
  this.languageSpoken = languageSpoken;
};
Human.prototype = Object.create(Mammal.prototype);
Human.prototype.constructor = Human;
Human.prototype.speak = function speak() {};
```

**Good:**
```javascript
class Animal {
  constructor(age) {
    this.age = age;
  }
  move() { /* ... */ }
}
class Mammal extends Animal {
  constructor(age, furColor) {
    super(age);
    this.furColor = furColor;
  }
  liveBirth() { /* ... */ }
}
class Human extends Mammal {
  constructor(age, furColor, languageSpoken) {
    super(age, furColor);
    this.languageSpoken = languageSpoken;
  }
  speak() { /* ... */ }
}
```

**なぜそうするかの理由:**
ES5のプロトタイプベースの継承は、記述が冗長で非常に複雑です。コンストラクタの呼び出し、プロトタイプチェーンの接続、`constructor`プロパティの再設定など、多くの定型的なコードが必要となり、可読性が低く、間違いやすいです。ES6の`class`構文は、これらの複雑な処理をシンプルで直感的なシンタックスシュガーで覆い隠してくれます。`class`, `constructor`, `extends`, `super`といったキーワードを使うことで、他のオブジェクト指向言語に慣れた開発者にとっても非常に読みやすく、書きやすいコードになります。

---

#### [classes-2] メソッドチェーンを使う

**Bad:**
```javascript
class Car {
  constructor(make, model, color) {
    this.make = make;
    this.model = model;
    this.color = color;
  }
  setMake(make) { this.make = make; }
  setModel(model) { this.model = model; }
  setColor(color) { this.color = color; }
  save() {
    console.log(this.make, this.model, this.color);
  }
}

const car = new Car("Ford", "F-150", "red");
car.setColor("pink");
car.save();
```

**Good:**
```javascript
class Car {
  constructor(make, model, color) {
    this.make = make;
    this.model = model;
    this.color = color;
  }
  setMake(make) {
    this.make = make;
    // NOTE: Returning this for chaining
    return this;
  }
  setModel(model) {
    this.model = model;
    // NOTE: Returning this for chaining
    return this;
  }
  setColor(color) {
    this.color = color;
    // NOTE: Returning this for chaining
    return this;
  }
  save() {
    console.log(this.make, this.model, this.color);
    // NOTE: Returning this for chaining
    return this;
  }
}

const car = new Car("Ford", "F-150", "red").setColor("pink").save();
```

**なぜそうするかの理由:**
メソッドチェーンは、jQueryやLodashなどの多くのライブラリで採用されている非常に強力なパターンです。各メソッドの最後に`return this;`を追加し、インスタンス自身を返すことで、複数のメソッドをドット(`.`)で繋げて連続的に呼び出すことができます。これにより、一時変数を減らし、コードをより表現力豊かで、流れるように簡潔に記述することができます。

---

#### [classes-3] 継承よりコンポジションを優先する

**Bad:**
```javascript
class Employee {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  // ...
}

// Bad because Employees "have" tax data. EmployeeTaxData is not a type of Employee
class EmployeeTaxData extends Employee {
  constructor(ssn, salary) {
    super();
    this.ssn = ssn;
    this.salary = salary;
  }
  // ...
}
```

**Good:**
```javascript
class EmployeeTaxData {
  constructor(ssn, salary) {
    this.ssn = ssn;
    this.salary = salary;
  }
  // ...
}

class Employee {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  setTaxData(ssn, salary) {
    this.taxData = new EmployeeTaxData(ssn, salary);
  }
  // ...
}
```

**なぜそうするかの理由:**
継承は「is-a」（〜は〜の一種である）の関係を表すのに適していますが、誤って使うとクラス間の結合を強め、柔軟性を失わせます。Badの例では、「従業員の税務データ」は「従業員の一種」ではないため、継承関係は不適切です。これは「has-a」（〜は〜を持つ）の関係です。このような場合は、コンポジション（合成）を使うべきです。Goodの例のように、`Employee`クラスが`EmployeeTaxData`クラスのインスタンスをプロパティとして持つことで、より柔軟で疎結合な設計になります。これにより、各クラスが独立して変更・再利用しやすくなります。

---

### **SOLID**

#### [solid-1] 単一責任の原則 (Single Responsibility Principle - SRP)

**Bad:**
```javascript
class UserSettings {
  constructor(user) {
    this.user = user;
  }

  changeSettings(settings) {
    if (this.verifyCredentials()) {
      // ...
    }
  }

  verifyCredentials() {
    // ...
  }
}
```

**Good:**
```javascript
class UserAuth {
  constructor(user) {
    this.user = user;
  }

  verifyCredentials() {
    // ...
  }
}

class UserSettings {
  constructor(user) {
    this.user = user;
    this.auth = new UserAuth(user);
  }

  changeSettings(settings) {
    if (this.auth.verifyCredentials()) {
      // ...
    }
  }
}
```

**なぜそうするかの理由:**
「クラスが変更される理由は、一つだけであるべき」という原則です。Badの例では、`UserSettings`クラスが「設定の変更」と「資格情報の検証」という2つの責任を持っています。これにより、認証ロジックの変更が設定変更のロジックに影響を与える可能性があり、クラスの凝集度が低くなります。Goodの例のように、`UserAuth`クラスとして認証の責任を分離することで、各クラスは単一の責任を持つようになります。これにより、コードの理解が容易になり、変更が必要な際の影響範囲を限定できるため、メンテナンス性が向上します。

---

<h4><a name="solid-2"></a>[solid-2] オープン・クローズドの原則 (Open/Closed Principle - OCP)</h4>

**Bad:**```javascript
class AjaxAdapter extends Adapter {
  constructor() {
    super();
    this.name = "ajaxAdapter";
  }
}

class NodeAdapter extends Adapter {
  constructor() {
    super();
    this.name = "nodeAdapter";
  }
}

class HttpRequester {
  constructor(adapter) {
    this.adapter = adapter;
  }

  fetch(url) {
    if (this.adapter.name === "ajaxAdapter") {
      return makeAjaxCall(url).then(response => {
        // transform response and return
      });
    } else if (this.adapter.name === "nodeAdapter") {
      return makeHttpCall(url).then(response => {
        // transform response and return
      });
    }
  }
}
```

**Good:**
```javascript
class AjaxAdapter extends Adapter {
  constructor() {
    super();
    this.name = "ajaxAdapter";
  }

  request(url) {
    // request and return promise
  }
}

class NodeAdapter extends Adapter {
  constructor() {
    super();
    this.name = "nodeAdapter";
  }

  request(url) {
    // request and return promise
  }
}

class HttpRequester {
  constructor(adapter) {
    this.adapter = adapter;
  }

  fetch(url) {
    return this.adapter.request(url).then(response => {
      // transform response and return
    });
  }
}
```

**なぜそうするかの理由:**
「ソフトウェアのエンティティ（クラス、モジュール、関数など）は、拡張に対しては開いて（オープン）いるべきだが、修正に対しては閉じて（クローズド）いるべきだ」という原則です。Badの例では、新しい種類のアダプター（例えば`FetchAdapter`）を追加するたびに、`HttpRequester`クラスの`fetch`メソッド内の`if-else`文を修正する必要があります。これは原則に違反しています。Goodの例では、すべてのアダプターが共通の`request`メソッドを持つように設計されています。これにより、`HttpRequester`はアダプターの具体的な実装を知る必要がなく、新しいアダプターを追加する際も`HttpRequester`のコードを一切変更することなく、システムを拡張できます。

---

<h4><a name="solid-3"></a>[solid-3] リスコフの置換原則 (Liskov Substitution Principle - LSP)</h4>

**Bad:**
```javascript
class Rectangle {
  constructor() {
    this.width = 0;
    this.height = 0;
  }
  // ...
  setWidth(width) { this.width = width; }
  setHeight(height) { this.height = height; }
  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(width) {
    this.width = width;
    this.height = width;
  }
  setHeight(height) {
    this.width = height;
    this.height = height;
  }
}

function renderLargeRectangles(rectangles) {
  rectangles.forEach(rectangle => {
    rectangle.setWidth(4);
    rectangle.setHeight(5);
    const area = rectangle.getArea(); // BAD: Returns 25 for Square. Should be 20.
    rectangle.render(area);
  });
}
```

**Good:**
```javascript
class Shape {
  // ...
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  getArea() { return this.width * this.height; }
}

class Square extends Shape {
  constructor(length) {
    super();
    this.length = length;
  }
  getArea() { return this.length * this.length; }
}

function renderLargeShapes(shapes) {
  shapes.forEach(shape => {
    const area = shape.getArea();
    shape.render(area);
  });
}
```

**なぜそうするかの理由:**
「親クラスのオブジェクトを、その子クラスのオブジェクトに置き換えても、プログラムの正しさが損なわれてはならない」という原則です。Badの例では、`Square`は`Rectangle`を継承していますが、`setWidth`や`setHeight`の振る舞いが親クラスと異なります（幅を設定すると高さも変わる）。これにより、`renderLargeRectangles`関数のように親クラス(`Rectangle`)を期待するコードに子クラス(`Square`)のインスタンスを渡すと、`getArea()`が期待しない値（20ではなく25）を返し、プログラムが不正な動作をします。これはLSPに違反しています。Goodの例のように、振る舞いが異なる場合は共通の親クラス（`Shape`）を継承しつつ、それぞれを独立したクラスとして実装することで、この問題を回避できます。

---

<h4><a name="solid-4"></a>[solid-4] インターフェース分離の原則 (Interface Segregation Principle - ISP)</h4>

**Bad:**
```javascript
class DOMTraverser {
  constructor(settings) {
    this.settings = settings;
    this.setup();
  }
  setup() {
    this.rootNode = this.settings.rootNode;
    this.settings.animationModule.setup();
  }
  traverse() { /* ... */ }
}

const $ = new DOMTraverser({
  rootNode: document.getElementsByTagName("body"),
  animationModule() {} // Most of the time, we won't need to animate when traversing.
  // ...
});
```

**Good:**
```javascript
class DOMTraverser {
  constructor(settings) {
    this.settings = settings;
    this.options = settings.options;
    this.setup();
  }
  setup() {
    this.rootNode = this.settings.rootNode;
    this.setupOptions();
  }
  setupOptions() {
    if (this.options.animationModule) {
      // ...
    }
  }
  traverse() { /* ... */ }
}

const $ = new DOMTraverser({
  rootNode: document.getElementsByTagName("body"),
  options: {
    animationModule() {}
  }
});
```

**なぜそうするかの理由:**
「クライアントに、彼らが使わないインターフェースへの依存を強制してはならない」という原則です。JavaScriptには明示的なインターフェースはありませんが、オブジェクトのプロパティやメソッドの形状がそれに当たります。Badの例では、`DOMTraverser`を使う全てのクライアントが、たとえ使わない場合でも`animationModule`を含む巨大な`settings`オブジェクトを提供する必要があります。これは「太ったインターフェース」と呼ばれ、無駄が多く不便です。Goodの例のように、必須の設定とオプションの設定を分離することで、クライアントは自分が必要なものだけを提供すればよくなり、インターフェースがよりクリーンで使いやすくなります。

---

<h4><a name="solid-5"></a>[solid-5] 依存性逆転の原則 (Dependency Inversion Principle - DIP)</h4>

**Bad:**
```javascript
class InventoryRequester {
  constructor() {
    this.REQ_METHODS = ["HTTP"];
  }
  requestItem(item) { /* ... */ }
}

class InventoryTracker {
  constructor(items) {
    this.items = items;
    // BAD: We have created a dependency on a specific request implementation.
    this.requester = new InventoryRequester();
  }
  requestItems() {
    this.items.forEach(item => {
      this.requester.requestItem(item);
    });
  }
}
```

**Good:**
```javascript
class InventoryTracker {
  constructor(items, requester) {
    this.items = items;
    this.requester = requester;
  }
  requestItems() {
    this.items.forEach(item => {
      this.requester.requestItem(item);
    });
  }
}

class InventoryRequesterV1 { /* ... */ }
class InventoryRequesterV2 { /* ... */ }

// By constructing our dependencies externally and injecting them, we can easily
// substitute our request module for a fancy new one that uses WebSockets.
const inventoryTracker = new InventoryTracker(
  ["apples", "bananas"],
  new InventoryRequesterV2()
);
```

**なぜそうするかの理由:**
「1. 上位レベルのモジュールは、下位レベルのモジュールに依存すべきではない。両方とも抽象に依存すべきだ。 2. 抽象は詳細に依存すべきではない。詳細が抽象に依存すべきだ」という原則です。Badの例では、上位モジュールである`InventoryTracker`が、下位モジュールである`InventoryRequester`の具体的な実装に直接依存しています（`new InventoryRequester()`）。これにより、両者は密結合になり、`InventoryRequester`を別のもの（例：WebSocket版）に差し替えるのが困難になります。Goodの例では、依存性を外部から注入（Dependency Injection）しています。`InventoryTracker`は`requester`がどのような実装かを知らず、`requestItem`メソッドを持つという「抽象（インターフェース）」にのみ依存します。これにより、モジュール間の結合が弱まり、テストや機能拡張が容易になります。

---

### **テスト (Testing)**

#### [testing-1] 1つのテストでは1つの概念のみを扱う

**Bad:**
```javascript
import assert from "assert";

describe("MomentJS", () => {
  it("handles date boundaries", () => {
    let date;

    date = new MomentJS("1/1/2015");
    date.addDays(30);
    assert.equal("1/31/2015", date);

    date = new MomentJS("2/1/2016");
    date.addDays(28);
    assert.equal("02/29/2016", date);

    date = new MomentJS("2/1/2015");
    date.addDays(28);
    assert.equal("03/01/2015", date);
  });
});
```

**Good:**
```javascript
import assert from "assert";

describe("MomentJS", () => {
  it("handles 30-day months", () => {
    const date = new MomentJS("1/1/2015");
    date.addDays(30);
    assert.equal("1/31/2015", date);
  });

  it("handles leap year", () => {
    const date = new MomentJS("2/1/2016");
    date.addDays(28);
    assert.equal("02/29/2016", date);
  });

  it("handles non-leap year", () => {
    const date = new MomentJS("2/1/2015");
    date.addDays(28);
    assert.equal("03/01/2015", date);
  });
});
```

**なぜそうするかの理由:**
Badの例のように、1つの`it`ブロックに複数のアサーション（テストケース）を詰め込むと、テストが失敗した際に、どのケースが原因で失敗したのかを特定するのが難しくなります。また、テストの意図も曖昧になります。Goodの例のように、「30日の月」「うるう年」「平年」といった個別の概念ごとにテストを分割することで、各テストの目的が明確になります。テストが失敗した場合、そのテスト名を見るだけでどの機能に問題があるのかがすぐに分かり、デバッグが迅速に行えます。


#### [testing-2] テストのitは日本語でわかりやすく書く

**Bad:**
```javascript
it("should handle 30-day months", () => {
  const date = new MomentJS("1/1/2015");
  date.addDays(30);
  assert.equal("1/31/2015", date);
});
```

**Good:**
```javascript
it("30日の月を処理できる", () => {
  const date = new MomentJS("1/1/2015");
  date.addDays(30);
  assert.equal("1/31/2015", date);
});
```

#### [testing-3] テストでのみ共有する処理は専用ヘルパーに抽出する

**Bad:**
```typescript
describe("UserRepository", () => {
  const database = createInMemoryDb();

  it("ユーザーを保存できる", () => {
    const user = {
      id: "user-1",
      name: "山田太郎",
      email: "taro@example.com",
      createdAt: new Date("2024-01-01"),
      status: "active",
    };

    insertUser(database, user);
    expect(fetchUser(database, user.id)).toEqual(user);
  });

  it("ユーザーを更新できる", () => {
    const user = {
      id: "user-1",
      name: "山田太郎",
      email: "taro@example.com",
      createdAt: new Date("2024-01-01"),
      status: "active",
    };

    insertUser(database, user);
    updateUser(database, { ...user, status: "inactive" });
    expect(fetchUser(database, user.id)?.status).toBe("inactive");
  });
});
```

**Good:**
```typescript
// tests/user.test.ts
import { createUserFixture } from "./helpers/createUserFixture";

describe("UserRepository", () => {
  const database = createInMemoryDb();

  it("ユーザーを保存できる", () => {
    const user = createUserFixture();
    insertUser(database, user);
    expect(fetchUser(database, user.id)).toEqual(user);
  });

  it("ユーザーを更新できる", () => {
    const user = createUserFixture();
    insertUser(database, user);
    updateUser(database, { ...user, status: "inactive" });
    expect(fetchUser(database, user.id)?.status).toBe("inactive");
  });
});

// tests/helpers/createUserFixture.ts
export const createUserFixture = (overrides: Partial<User> = {}) => ({
  id: "user-1",
  name: "山田太郎",
  email: "taro@example.com",
  createdAt: new Date("2024-01-01"),
  status: "active",
  ...overrides,
});
```

**なぜそうするかの理由:**
テストでのみ使う初期化処理を各テストに重複して書くと、仕様変更時に修正漏れが発生しやすく、テストコードの意図もノイズに埋もれます。テスト専用のヘルパー関数として共通化すると、フィクスチャの更新を一箇所で済ませられ、テスト本体は振る舞いの検証に集中できます。また、実装コードへ不要なヘルパーを公開することも避けられ、責務の境界が明確になります。

---

### **並行処理 (Concurrency)**

#### [concurrency-1] コールバックではなくPromiseを使う

**Bad:**
```javascript
import { get } from "request";
import { writeFile } from "fs";

get(
  "https://en.wikipedia.org/wiki/Robert_Cecil_Martin",
  (requestErr, response, body) => {
    if (requestErr) {
      console.error(requestErr);
    } else {
      writeFile("article.html", body, writeErr => {
        if (writeErr) {
          console.error(writeErr);
        } else {
          console.log("File written");
        }
      });
    }
  }
);
```

**Good:**
```javascript
import { get } from "request-promise";
import { writeFile } from "fs-extra";

get("https://en.wikipedia.org/wiki/Robert_Cecil_Martin")
  .then(body => {
    return writeFile("article.html", body);
  })
  .then(() => {
    console.log("File written");
  })
  .catch(err => {
    console.error(err);
  });
```

**なぜそうするかの理由:**
コールバック関数を使った非同期処理は、処理が連鎖するとネストが深くなり、コードが右に伸びていく「コールバック地獄（Callback Hell）」または「破滅のピラミッド（Pyramid of Doom）」と呼ばれる状態に陥ります。これはコードの可読性を著しく低下させ、エラーハンドリングも複雑になります。ES6で標準化されたPromiseを使うと、`.then()`で処理を繋げていくことで、非同期処理をフラットな構造で記述できます。また、`.catch()`によって、チェーンのどこで発生したエラーも一箇所で捕捉できるため、エラーハンドリングが劇的にクリーンになります。

---

#### [concurrency-2] PromiseよりもさらにクリーンなAsync/Awaitを使う

**Bad:**
```javascript
import { get } from "request-promise";
import { writeFile } from "fs-extra";

get("https://en.wikipedia.org/wiki/Robert_Cecil_Martin")
  .then(body => {
    return writeFile("article.html", body);
  })
  .then(() => {
    console.log("File written");
  })
  .catch(err => {
    console.error(err);
  });
```

**Good:**
```javascript
import { get } from "request-promise";
import { writeFile } from "fs-extra";

async function getCleanCodeArticle() {
  try {
    const body = await get(
      "https://en.wikipedia.org/wiki/Robert_Cecil_Martin"
    );
    await writeFile("article.html", body);
    console.log("File written");
  } catch (err) {
    console.error(err);
  }
}

getCleanCodeArticle()
```

**なぜそうするかの理由:**
Promiseはコールバック地獄を解決しましたが、`.then()`のチェーンは依然としてコールバック関数を必要とします。ES2017で導入された`async/await`構文を使うと、非同期処理をまるで同期処理のように、上から下へ流れる命令的なスタイルで記述できます。`await`キーワードがPromiseの結果が返されるのを待ってくれるため、`.then()`チェーンは不要になります。エラーハンドリングも、使い慣れた`try/catch`ブロックで自然に記述できます。これにより、非同期コードの可読性と保守性がさらに向上します。

---

### **エラーハンドリング (Error Handling)**

#### [error-1] キャッチしたエラーを無視しない

**Bad:**
```javascript
try {
  functionThatMightThrow();
} catch (error) {
  console.log(error);
}
```

**Good:**
```javascript
try {
  functionThatMightThrow();
} catch (error) {
  // One option (more noisy than console.log):
  console.error(error);
  // Another option:
  notifyUserOfError(error);
  // Another option:
  reportErrorToService(error);
  // OR do all three!
}
```

**なぜそうするかの理由:**
`try/catch`でエラーを捕捉したにもかかわらず、何もしない、あるいは単に`console.log`で出力するだけでは、エラーが発生したという事実を握りつぶしているのと同じです。`console.log`は他の多くのログに紛れて見過ごされがちです。エラーが発生する可能性があると予測して`try/catch`を記述したからには、そのエラーに対して何らかの対処計画を持つべきです。ユーザーにエラーを通知する、エラー報告サービスに送信する、あるいは`console.error`で明確にエラーとして出力するなど、エラーに対応するための具体的なコードパスを作成することが重要です。

---

#### [error-2] 拒否されたPromiseを無視しない

**Bad:**
```javascript
getdata()
  .then(data => {
    functionThatMightThrow(data);
  })
  .catch(error => {
    console.log(error);
  });
```

**Good:**
```javascript
getdata()
  .then(data => {
    functionThatMightThrow(data);
  })
  .catch(error => {
    // One option (more noisy than console.log):
    console.error(error);
    // Another option:
    notifyUserOfError(error);
    // Another option:
    reportErrorToService(error);
    // OR do all three!
  });
```

**なぜそうするかの理由:**
これは`try/catch`でエラーを無視すべきでないのと同じ理由です。Promiseチェーンで発生したエラー（Promiseがrejected状態になること）は、`.catch()`ブロックで捕捉されます。これを単に`console.log`で出力するだけでは、エラーが効果的に処理されたとは言えません。エラーの発生はプログラムの異常事態であり、それに応じてユーザーへの通知や、開発者が問題を追跡するためのログ記録など、適切なアクションを取るべきです。

---

### **フォーマット (Formatting)**

#### [formatting-1] 大文字小文字の使い分けを一貫させる

**Bad:**
```javascript
const DAYS_IN_WEEK = 7;
const daysInMonth = 30;

const songs = ["Back In Black", "Stairway to Heaven", "Hey Jude"];
const Artists = ["ACDC", "Led Zeppelin", "The Beatles"];

function eraseDatabase() {}
function restore_database() {}

class animal {}
class Alpaca {}
```

**Good:**
```javascript
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;

const SONGS = ["Back In Black", "Stairway to Heaven", "Hey Jude"];
const ARTISTS = ["ACDC", "Led Zeppelin", "The Beatles"];

function eraseDatabase() {}
function restoreDatabase() {}

class Animal {}
class Alpaca {}
```

**なぜそうするかの理由:**
フォーマットのルールは主観的なものが多いですが、最も重要なのはチーム内で一貫性を保つことです。大文字小文字の使い分けは、変数、定数、関数、クラスなどのエンティティの種類を視覚的に伝えるための重要な慣習です。例えば、「定数はすべて大文字のスネークケース（`UPPER_SNAKE_CASE`）」「クラス名はアッパーキャメルケース（`PascalCase`）」「変数や関数名はローワーキャメルケース（`camelCase`）」といったルールを決め、プロジェクト全体でそれを遵守することで、コードの可読性が向上し、新しいコードを読んだり書いたりする際の認知的な負荷が軽減されます。

---

#### [formatting-2] 関数を呼び出す側と呼び出される側を近くに配置する

**Bad:**
```javascript
class PerformanceReview {
  constructor(employee) { /* ... */ }
  lookupPeers() { /* ... */ }
  lookupManager() { /* ... */ }
  getPeerReviews() { /* ... */ }
  perfReview() {
    this.getPeerReviews();
    this.getManagerReview();
    this.getSelfReview();
  }
  getManagerReview() { /* ... */ }
  getSelfReview() { /* ... */ }
}```

**Good:**
```javascript
class PerformanceReview {
  constructor(employee) { /* ... */ }

  perfReview() {
    this.getPeerReviews();
    this.getManagerReview();
    this.getSelfReview();
  }

  getPeerReviews() {
    const peers = this.lookupPeers();
    // ...
  }

  lookupPeers() {
    return db.lookup(this.employee, "peers");
  }

  getManagerReview() {
    const manager = this.lookupManager();
  }

  lookupManager() {
    return db.lookup(this.employee, "manager");
  }

  getSelfReview() {
    // ...
  }
}
```

**なぜそうするかの理由:**
コードは新聞のように、上から下へと読まれるのが自然です。高レベルの抽象度を持つ関数（呼び出し側）を上に配置し、それが依存する低レベルの詳細な関数（呼び出される側）をその下に配置することで、コードのストーリーが自然な流れで理解できるようになります。Badの例では、`perfReview`から呼び出される関数がクラス内のあちこちに散らばっており、処理の流れを追うのが困難です。Goodの例のように関数を配置することで、読み手はコードを上から下に読み進めるだけで、処理の全体像から詳細へとスムーズに理解を深めることができます。

---

### **コメント (Comments)**

#### [comments-1] ビジネスロジックが複雑なものにだけコメントする

**Bad:**
```javascript
function hashIt(data) {
  // The hash
  let hash = 0;

  // Length of string
  const length = data.length;

  // Loop through every character in data
  for (let i = 0; i < length; i++) {
    // Get character code.
    const char = data.charCodeAt(i);
    // Make the hash
    hash = (hash << 5) - hash + char;
    // Convert to 32-bit integer
    hash &= hash;
  }
}
```

**Good:**
```javascript
function hashIt(data) {
  let hash = 0;
  const length = data.length;

  for (let i = 0; i < length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;

    // Convert to 32-bit integer
    hash &= hash;
  }
}
```

**なぜそうするかの理由:**
コメントは、コードだけでは表現できない「なぜ」そのように実装したのか、という背景や意図を説明するためにあるべきです。Badの例のように、コードを読めばわかる「何を」しているのかを説明するコメントは、コードのノイズにしかなりません。良いコードは、それ自体がドキュメントとして機能するべきです（自己文書化コード）。コメントは、コードの不出来を補うための「謝罪」であり、必要悪です。複雑なアルゴリズムやビジネスルールなど、コードだけでは意図が伝わりにくい場合に限定して、簡潔に記述するべきです。

---

#### [comments-2] コメントアウトされたコードをコードベースに残さない

**Bad:**
```javascript
doStuff();
// doOtherStuff();
// doSomeMoreStuff();
// doSoMuchStuff();
```

**Good:**
```javascript
doStuff();
```

**なぜそうするかの理由:**
バージョン管理システム（Gitなど）が存在する現代において、古いコードをコメントアウトして残しておく理由はありません。これはコードベースを汚し、他の開発者が「このコードはなぜコメントアウトされているのか？」「将来必要になるのか？」といった無駄な混乱と思考を強いることになります。不要になったコードは、ためらわずに削除するべきです。必要になれば、いつでもバージョン管理システムの履歴から復元できます。

---

#### [comments-3] 変更履歴のようなコメントを残さない

**Bad:**
```javascript
/**
 * 2016-12-20: Removed monads, didn't understand them (RM)
 * 2016-10-01: Improved using special monads (JP)
 * 2016-02-03: Removed type-checking (LI)
 * 2015-03-14: Added combine with type-checking (JR)
 */
function combine(a, b) {
  return a + b;
}
```

**Good:**
```javascript
function combine(a, b) {
  return a + b;
}
```

**なぜそうするかの理由:**
誰が、いつ、どのような変更を加えたかという履歴情報は、バージョン管理システム（Gitなど）が完璧に管理してくれます。`git log`や`git blame`といったコマンドを使えば、これらの情報はいつでも確認できます。コード内にこのような履歴コメントを残すことは、バージョン管理システムの役割と重複しており、単なるノイズです。コードは常に、その時点での最新かつクリーンな状態を保つべきです。

---

#### [comments-4] 位置を示すマーカーを使わない

**Bad:**
```javascript
////////////////////////////////////////////////////////////////////////////////
// Scope Model Instantiation
////////////////////////////////////////////////////////////////////////////////
$scope.model = {
  menu: "foo",
  nav: "bar"
};

////////////////////////////////////////////////////////////////////////////////
// Action setup
////////////////////////////////////////////////////////////////////////////////
const actions = function() {
  // ...
};
```

**Good:**
```javascript
$scope.model = {
  menu: "foo",
  nav: "bar"
};

const actions = function() {
  // ...
};
```

**なぜそうするかの理由:**
このような装飾的なコメントマーカーは、コードの視覚的な構造を強調しようとするものですが、ほとんどの場合は単なるノイズであり、コードの可読性をかえって損ないます。適切なインデント、空行によるセクションの区切り、そして意味のある変数名や関数名があれば、コードの構造は十分に伝わります。マーカーはコードの変更に伴ってメンテナンスする必要も生じ、手間が増えるだけでメリットはほとんどありません。

</check>

<template>

## 0. サマリー

* 結論: {合否や大枠の評価。例: 重大なMustが2件、Shouldが5件。設計の方向性は妥当}
* 最重要3件:

  1. {[category-id] 一言要約 / 判定: Must / 影響: 高}
  2. {…}
  3. {…}
* 集計: OK {n} / Should {n} / **Must {n}** / Discuss {n} / Praise {n}

---

## 1. 判定一覧（一覧で俯瞰）

| ID          | 判定     | 重要度 | 一言要約                 |
| ----------- | ------ | --- | -------------------- |
| variables-1 | Must   | 高   | 変数名が意味不明（yyyymmdstr） |
| functions-2 | Should | 中   | 関数が複数責務              |
| …           | …      | …   | …                    |

> 判定の定義:
>
> * **OK**: 修正不要
> * **Should**: 余裕があれば直す（品質向上）
> * **Must**: マージ前に直す（不具合/保守不能の恐れ）
> * **Discuss**: 仕様・設計の合意が先
> * **Praise**: 特に良い点（学びとして共有）

---

## 2. 個別レビュー（カード形式・1論点1カード）

### {[category-id]} {短い見出し}

* **判定**: {OK / Should / Must / Discuss}
* **重要度**: {高/中/低}
* **根拠（事実）**: {該当コード短い抜粋 or 行番号・関数名等}
* **理由（なぜ問題か / なぜ良いか）**: {平易に1-2文}
* **影響**: {バグ/可読性/将来の変更コスト/検索性 等}
* **修正案（具体）**:

  * 案A: {最短で直す手順（数行の置換・命名例）}
  * 案B: {構造を見直す手順（関数分割・責務分離 等）}
* **確認方法**: {テスト・静的解析・lint設定等}
* **Owner/期限**: {@担当者 / いつまで}

> 例（埋めた形）
>
> ```
> [variables-1] 名前が意味を伝えていない
> 判定: Must / 重要度: 高
> 根拠: const yyyymmdstr = moment().format("YYYY/MM/DD");
> 理由: 目的が読み取れず口頭伝達もしづらい。検索も困難。
> 影響: 可読性低下、レビューミスの温床
> 修正案:
>  - 案A: 変数名を `currentDate` に変更
>  - 案B: 日付用途ごとに `invoiceDate` など役割名に
> 確認方法: 変数出現箇所を全置換後に型チェック通過を確認
> Owner/期限: @tanaka / 本日中
> ```
</template>

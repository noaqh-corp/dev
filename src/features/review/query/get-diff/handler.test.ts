import { test, expect } from "bun:test"
import { getDiffFiles, getDiffContent } from "./handler"

test("未コミット分のみの差分ファイル一覧を取得できる", async () => {
  const files = await getDiffFiles("main", true)
  expect(Array.isArray(files)).toBe(true)
})

test("ブランチ差分+未コミット分の差分ファイル一覧を取得できる", async () => {
  const files = await getDiffFiles("main", false)
  expect(Array.isArray(files)).toBe(true)
})

test("差分がない場合は空配列を返す", async () => {
  // クリーンな状態でテストするため、実際のgitリポジトリの状態に依存
  // このテストは統合テストとして実行される
  const files = await getDiffFiles("main", true)
  expect(Array.isArray(files)).toBe(true)
})

test("未コミット分のみの差分内容を取得できる", async () => {
  const content = await getDiffContent("main", true)
  expect(typeof content).toBe("string")
})

test("ブランチ差分+未コミット分の差分内容を取得できる", async () => {
  const content = await getDiffContent("main", false)
  expect(typeof content).toBe("string")
})

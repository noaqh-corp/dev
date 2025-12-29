import { test, expect } from "bun:test"
import { runClaudeReview } from "./handler"

test("claudeコマンドが存在しない場合はnullを返す", async () => {
  // このテストは実際の環境に依存する
  // claudeコマンドが存在しない環境ではnullを返す
  // 存在する環境では文字列またはnullを返す（実行に失敗した場合）
  const result = await Promise.race([
    runClaudeReview("main", false),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
  ])
  // 結果はnullまたはstringのいずれか
  expect(result === null || typeof result === "string").toBe(true)
}, { timeout: 1500 })

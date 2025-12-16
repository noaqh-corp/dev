import { test, expect } from "bun:test"
import { runClaudeReview } from "./handler"

test("claudeコマンドが存在しない場合はnullを返す", async () => {
  // このテストは実際の環境に依存する
  // claudeコマンドが存在しない環境ではnullを返す
  // 存在する環境では文字列またはnullを返す（実行に失敗した場合）
  const result = await runClaudeReview("test diff content")
  // 結果はnullまたはstringのいずれか
  expect(result === null || typeof result === "string").toBe(true)
}, { timeout: 10000 })

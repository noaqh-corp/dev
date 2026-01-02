import { test, expect } from "bun:test"
import { runOxlint } from "./handler"

test("指定ファイルに対してoxlintを実行できる", async () => {
  const result = await runOxlint(["src/index.ts"], false)
  expect(result).toHaveProperty("success")
  expect(result).toHaveProperty("output")
  expect(result).toHaveProperty("errorCount")
  expect(result).toHaveProperty("warningCount")
  expect(typeof result.success).toBe("boolean")
  expect(typeof result.output).toBe("string")
  expect(typeof result.errorCount).toBe("number")
  expect(typeof result.warningCount).toBe("number")
})

test("プロジェクト全体に対してoxlintを実行できる", async () => {
  const result = await runOxlint([], true)
  expect(result).toHaveProperty("success")
  expect(result).toHaveProperty("output")
  expect(result).toHaveProperty("errorCount")
  expect(result).toHaveProperty("warningCount")
  expect(typeof result.success).toBe("boolean")
  expect(typeof result.output).toBe("string")
  expect(typeof result.errorCount).toBe("number")
  expect(typeof result.warningCount).toBe("number")
})

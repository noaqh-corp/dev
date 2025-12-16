import { test, expect } from "bun:test"
import { runBiomeLint } from "./handler"

test("指定ファイルに対してbiome lintを実行できる", async () => {
  const result = await runBiomeLint(["src/index.ts"], false)
  expect(result).toHaveProperty("success")
  expect(result).toHaveProperty("output")
  expect(result).toHaveProperty("errorCount")
  expect(result).toHaveProperty("warningCount")
  expect(typeof result.success).toBe("boolean")
  expect(typeof result.output).toBe("string")
  expect(typeof result.errorCount).toBe("number")
  expect(typeof result.warningCount).toBe("number")
})

test("プロジェクト全体に対してbiome lintを実行できる", async () => {
  const result = await runBiomeLint([], true)
  expect(result).toHaveProperty("success")
  expect(result).toHaveProperty("output")
  expect(result).toHaveProperty("errorCount")
  expect(result).toHaveProperty("warningCount")
  expect(typeof result.success).toBe("boolean")
  expect(typeof result.output).toBe("string")
  expect(typeof result.errorCount).toBe("number")
  expect(typeof result.warningCount).toBe("number")
})

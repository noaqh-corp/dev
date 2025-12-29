import { describe, it, expect } from "bun:test"
import { replacePathPlaceholders } from "./util"

describe("replacePathPlaceholders", () => {
  it("単一のプレースホルダーを正しく変換できる", () => {
    const content = '{{path("docs/architecture.md")}}'
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("/Users/hal/dev_tool/docs/architecture.md")
  })

  it("複数のプレースホルダーを正しく変換できる", () => {
    const content = '{{path("docs/architecture.md")}} と {{path("docs/review.md")}}'
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("/Users/hal/dev_tool/docs/architecture.md と /Users/hal/dev_tool/docs/review.md")
  })

  it("プレースホルダーがない場合は内容をそのまま返す", () => {
    const content = "これは通常のテキストです"
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("これは通常のテキストです")
  })

  it("ネストしたパス（例: docs/sub/file.md）も正しく変換できる", () => {
    const content = '{{path("docs/sub/file.md")}}'
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("/Users/hal/dev_tool/docs/sub/file.md")
  })

  it("GitHubのraw URLを絶対パスに変換できる", () => {
    const content = "(https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/architecture.md)"
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("(/Users/hal/dev_tool/docs/architecture.md)")
  })

  it("GitHubのblob URLを絶対パスに変換できる", () => {
    const content = "(https://github.com/noaqh-corp/dev/blob/main/docs/architecture.md)"
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("(/Users/hal/dev_tool/docs/architecture.md)")
  })

  it("複数のURLを正しく変換できる", () => {
    const content =
      "(https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/architecture.md) と (https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/review.md)"
    const projectRoot = "/Users/hal/dev_tool"
    const result = replacePathPlaceholders(content, projectRoot)
    expect(result).toBe("(/Users/hal/dev_tool/docs/architecture.md) と (/Users/hal/dev_tool/docs/review.md)")
  })
})


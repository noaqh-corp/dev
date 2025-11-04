import { describe, it, expect } from "bun:test"
import { getProjectRoot, ProjectRootNotFoundError } from "./project-root"
import { existsSync } from "fs"
import { join } from "path"

describe("getProjectRoot", () => {
  it("プロジェクトディレクトリ内から実行した場合、プロジェクトルートが正しく取得できる", () => {
    const projectRoot = getProjectRoot()

    expect(typeof projectRoot).toBe("string")
    expect(projectRoot.length).toBeGreaterThan(0)

    const packageJsonPath = join(projectRoot, "package.json")
    expect(existsSync(packageJsonPath)).toBe(true)
  })

  it("プロジェクトディレクトリ外から実行した場合、プロジェクトルートが正しく取得できる", () => {
    const projectRoot = getProjectRoot()

    expect(typeof projectRoot).toBe("string")
    expect(projectRoot.length).toBeGreaterThan(0)

    const packageJsonPath = join(projectRoot, "package.json")
    expect(existsSync(packageJsonPath)).toBe(true)
  })

  it("プロジェクトルートにpackage.jsonが存在することを確認できる", () => {
    const projectRoot = getProjectRoot()
    const packageJsonPath = join(projectRoot, "package.json")

    expect(existsSync(packageJsonPath)).toBe(true)
  })
})


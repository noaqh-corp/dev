import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, writeFile, readFile, rm } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { installPrompts, installClaudeCodePrompts, installRooPrompts, installCodexSkillsPrompts, installClaudeSkillsPrompts } from "./handler"
import { getProjectRoot } from "../../../../util/project-root"

describe("installPrompts", () => {
  let tempDir: string
  let sourceDir: string
  let destDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `test-prompts-${Date.now()}`)
    sourceDir = join(tempDir, "source")
    destDir = join(tempDir, "dest")
    await mkdir(sourceDir, { recursive: true })
    await mkdir(destDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it("installPromptsでプレースホルダーが絶対パスに変換される", async () => {
    const testContent = '{{path("docs/architecture.md")}}'
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installPrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const destFile = join(destDir, "n-test.md")
    const content = await readFile(destFile, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain('{{path("docs/architecture.md")}}')
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })

  it("installClaudeCodePromptsでプレースホルダーが絶対パスに変換される", async () => {
    const testContent = '{{path("docs/architecture.md")}}'
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installClaudeCodePrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const destFile = join(destDir, "n-test.md")
    const content = await readFile(destFile, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain('{{path("docs/architecture.md")}}')
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })

  it("installRooPromptsでプレースホルダーが絶対パスに変換される", async () => {
    const testContent = '{{path("docs/architecture.md")}}'
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installRooPrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const destFile = join(destDir, "n-test.md")
    const content = await readFile(destFile, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain('{{path("docs/architecture.md")}}')
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })

  it("installCodexSkillsPromptsでプレースホルダーが絶対パスに変換される", async () => {
    const testContent = '{{path("docs/architecture.md")}}'
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installCodexSkillsPrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const skillDir = join(destDir, "test")
    const skillMdPath = join(skillDir, "SKILL.md")
    const content = await readFile(skillMdPath, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain('{{path("docs/architecture.md")}}')
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })

  it("installClaudeSkillsPromptsでプレースホルダーが絶対パスに変換される", async () => {
    const testContent = '{{path("docs/architecture.md")}}'
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installClaudeSkillsPrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const skillDir = join(destDir, "test")
    const skillMdPath = join(skillDir, "SKILL.md")
    const content = await readFile(skillMdPath, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain('{{path("docs/architecture.md")}}')
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })

  it("installPromptsでURLが絶対パスに変換される", async () => {
    const testContent = "(https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/architecture.md)"
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installPrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const destFile = join(destDir, "n-test.md")
    const content = await readFile(destFile, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain("https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/architecture.md")
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })

  it("installPromptsでGitHubのblob URLが絶対パスに変換される", async () => {
    const testContent = "(https://github.com/noaqh-corp/dev/blob/main/docs/architecture.md)"
    const sourceFile = join(sourceDir, "test.md")
    await writeFile(sourceFile, testContent, "utf-8")

    await installPrompts({
      sourceDir,
      destinationDir: destDir,
    })

    const destFile = join(destDir, "n-test.md")
    const content = await readFile(destFile, "utf-8")
    const projectRoot = getProjectRoot()
    expect(content).not.toContain("https://github.com/noaqh-corp/dev/blob/main/docs/architecture.md")
    expect(content).toContain(join(projectRoot, "docs/architecture.md"))
  })
})


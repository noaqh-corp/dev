import { copyFile, mkdir, readdir, rm, stat, readFile, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { basename, extname, join } from "path"
import { homedir } from "os"
import type { InstallPromptsOptions, InstallPromptsResult } from "../../types"
import { getProjectRoot } from "../../../../util/project-root"

const DEFAULT_CODEX_DEST_DIR = join(homedir(), ".codex", "prompts")
const DEFAULT_CODEX_SKILLS_DEST_DIR = join(homedir(), ".codex", "skills")
const DEFAULT_CLAUDE_CODE_DEST_DIR = join(homedir(), ".claude", "commands")
const DEFAULT_ROO_DEST_DIR = join(homedir(), ".roo", "commands")
const DEFAULT_CLAUDE_SKILLS_DEST_DIR = join(homedir(), ".claude", "skills")
const DEFAULT_PREFIX = "n-"

export class PromptsSourceNotFoundError extends Error {
  constructor(public readonly sourceDir: string, options?: { cause?: unknown }) {
    super(`prompts ディレクトリが見つからないかアクセスできません: ${sourceDir}`, options)
    this.name = "PromptsSourceNotFoundError"
  }
}

export async function installPrompts(options: InstallPromptsOptions = {}): Promise<InstallPromptsResult> {
  const projectRoot = getProjectRoot()
  const defaultSourceDir = join(projectRoot, "prompts")
  const sourceDir = options.sourceDir ?? defaultSourceDir
  const destinationDir = options.destinationDir ?? DEFAULT_CODEX_DEST_DIR
  const prefix = options.filePrefix ?? DEFAULT_PREFIX

  await ensureSourceDirExists(sourceDir)
  await mkdir(destinationDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })
  const promptFiles = entries.filter((entry) => entry.isFile() && extname(entry.name) === ".md")

  if (promptFiles.length === 0) {
    return {
      copied: [],
      overwritten: [],
      warnings: ["prompts ディレクトリにコピー対象のMarkdownファイルが見つかりません。"],
    }
  }

  const copied: string[] = []
  const overwritten: string[] = []

  for (const entry of promptFiles) {
    const sourcePath = join(sourceDir, entry.name)
    const destinationName = `${prefix}${basename(entry.name)}`
    const destinationPath = join(destinationDir, destinationName)

    if (existsSync(destinationPath)) {
      await rm(destinationPath, { force: true })
      overwritten.push(destinationName)
    }

    await copyFile(sourcePath, destinationPath)
    copied.push(destinationName)
  }

  return {
    copied,
    overwritten,
    warnings: [],
  }
}

async function ensureSourceDirExists(sourceDir: string): Promise<void> {
  try {
    const directoryStat = await stat(sourceDir)
    if (!directoryStat.isDirectory()) {
      throw new PromptsSourceNotFoundError(sourceDir)
    }
  } catch (error) {
    throw new PromptsSourceNotFoundError(sourceDir, { cause: error })
  }
}

export async function installClaudeCodePrompts(options: InstallPromptsOptions = {}): Promise<InstallPromptsResult> {
  const projectRoot = getProjectRoot()
  const defaultSourceDir = join(projectRoot, "prompts")
  const sourceDir = options.sourceDir ?? defaultSourceDir
  const destinationDir = options.destinationDir ?? DEFAULT_CLAUDE_CODE_DEST_DIR
  const prefix = options.filePrefix ?? DEFAULT_PREFIX

  await ensureSourceDirExists(sourceDir)
  await mkdir(destinationDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })
  const promptFiles = entries.filter((entry) => entry.isFile() && extname(entry.name) === ".md")

  if (promptFiles.length === 0) {
    return {
      copied: [],
      overwritten: [],
      warnings: ["prompts ディレクトリにコピー対象のMarkdownファイルが見つかりません。"],
    }
  }

  const copied: string[] = []
  const overwritten: string[] = []

  for (const entry of promptFiles) {
    const sourcePath = join(sourceDir, entry.name)
    const destinationName = `${prefix}${basename(entry.name)}`
    const destinationPath = join(destinationDir, destinationName)

    if (existsSync(destinationPath)) {
      await rm(destinationPath, { force: true })
      overwritten.push(destinationName)
    }

    await copyFile(sourcePath, destinationPath)
    copied.push(destinationName)
  }

  return {
    copied,
    overwritten,
    warnings: [],
  }
}

export async function installRooPrompts(options: InstallPromptsOptions = {}): Promise<InstallPromptsResult> {
  const projectRoot = getProjectRoot()
  const defaultSourceDir = join(projectRoot, "prompts")
  const sourceDir = options.sourceDir ?? defaultSourceDir
  const destinationDir = options.destinationDir ?? DEFAULT_ROO_DEST_DIR
  const prefix = options.filePrefix ?? DEFAULT_PREFIX

  await ensureSourceDirExists(sourceDir)
  await mkdir(destinationDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })
  const promptFiles = entries.filter((entry) => entry.isFile() && extname(entry.name) === ".md")

  if (promptFiles.length === 0) {
    return {
      copied: [],
      overwritten: [],
      warnings: ["prompts ディレクトリにコピー対象のMarkdownファイルが見つかりません。"],
    }
  }

  const copied: string[] = []
  const overwritten: string[] = []

  for (const entry of promptFiles) {
    const sourcePath = join(sourceDir, entry.name)
    const destinationName = `${prefix}${basename(entry.name)}`
    const destinationPath = join(destinationDir, destinationName)

    if (existsSync(destinationPath)) {
      await rm(destinationPath, { force: true })
      overwritten.push(destinationName)
    }

    await copyFile(sourcePath, destinationPath)
    copied.push(destinationName)
  }

  return {
    copied,
    overwritten,
    warnings: [],
  }
}

type SkillMetadata = {
  name: string
  description: string
}

type SkillsConfig = Record<string, SkillMetadata>

async function loadSkillsConfig(sourceDir: string): Promise<SkillsConfig | null> {
  const configPath = join(sourceDir, "skills-config.json")
  try {
    if (existsSync(configPath)) {
      const content = await readFile(configPath, "utf-8")
      return JSON.parse(content) as SkillsConfig
    }
  } catch (error) {
    // 設定ファイルが存在しない、または読み込みに失敗した場合はnullを返す
  }
  return null
}

function generateSkillNameFromFilename(filename: string): string {
  const baseName = basename(filename, ".md")
  // ファイル名からスキル名を生成（ハイフン区切りに変換）
  return baseName.replace(/_/g, "-")
}

async function extractDescriptionFromPrompt(promptPath: string): Promise<string> {
  try {
    const content = await readFile(promptPath, "utf-8")
    const lines = content.split("\n").filter((line) => line.trim().length > 0)
    // 最初の1-2行からdescriptionを抽出（最大1024文字）
    const description = lines.slice(0, 2).join(" ").trim()
    return description.length > 1024 ? description.substring(0, 1021) + "..." : description
  } catch {
    return "プロンプトファイルから説明を抽出できませんでした。"
  }
}

function generateYamlFrontMatter(name: string, description: string): string {
  // nameとdescriptionをエスケープ（YAMLの特殊文字を処理）
  const escapedName = name.replace(/"/g, '\\"')
  const escapedDescription = description.replace(/"/g, '\\"').replace(/\n/g, " ")
  return `---
name: "${escapedName}"
description: "${escapedDescription}"
---

`
}

export async function installCodexSkillsPrompts(options: InstallPromptsOptions = {}): Promise<InstallPromptsResult> {
  const projectRoot = getProjectRoot()
  const defaultSourceDir = join(projectRoot, "prompts")
  const sourceDir = options.sourceDir ?? defaultSourceDir
  const destinationDir = options.destinationDir ?? DEFAULT_CODEX_SKILLS_DEST_DIR

  await ensureSourceDirExists(sourceDir)
  await mkdir(destinationDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })
  const promptFiles = entries.filter((entry) => entry.isFile() && extname(entry.name) === ".md" && entry.name !== "skills-config.json")

  if (promptFiles.length === 0) {
    return {
      copied: [],
      overwritten: [],
      warnings: ["prompts ディレクトリにコピー対象のMarkdownファイルが見つかりません。"],
    }
  }

  const skillsConfig = await loadSkillsConfig(sourceDir)
  const copied: string[] = []
  const overwritten: string[] = []

  for (const entry of promptFiles) {
    const sourcePath = join(sourceDir, entry.name)
    
    // メタデータを取得
    let skillName: string
    let description: string
    
    if (skillsConfig && skillsConfig[entry.name]) {
      skillName = skillsConfig[entry.name].name
      description = skillsConfig[entry.name].description
    } else {
      // フォールバック: ファイル名から生成
      skillName = generateSkillNameFromFilename(entry.name)
      description = await extractDescriptionFromPrompt(sourcePath)
    }

    // スキルディレクトリを作成
    const skillDir = join(destinationDir, skillName)
    await mkdir(skillDir, { recursive: true })

    // SKILL.mdファイルのパス
    const skillMdPath = join(skillDir, "SKILL.md")

    // プロンプトファイルの内容を読み込み
    const promptContent = await readFile(sourcePath, "utf-8")

    // YAMLフロントマターを生成
    const yamlFrontMatter = generateYamlFrontMatter(skillName, description)

    // SKILL.mdファイルを作成
    const skillMdContent = yamlFrontMatter + promptContent

    if (existsSync(skillMdPath)) {
      await rm(skillMdPath, { force: true })
      overwritten.push(`${skillName}/SKILL.md`)
    }

    await writeFile(skillMdPath, skillMdContent, "utf-8")
    copied.push(`${skillName}/SKILL.md`)
  }

  return {
    copied,
    overwritten,
    warnings: [],
  }
}

export async function installClaudeSkillsPrompts(options: InstallPromptsOptions = {}): Promise<InstallPromptsResult> {
  const projectRoot = getProjectRoot()
  const defaultSourceDir = join(projectRoot, "prompts")
  const sourceDir = options.sourceDir ?? defaultSourceDir
  const destinationDir = options.destinationDir ?? DEFAULT_CLAUDE_SKILLS_DEST_DIR

  await ensureSourceDirExists(sourceDir)
  await mkdir(destinationDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })
  const promptFiles = entries.filter((entry) => entry.isFile() && extname(entry.name) === ".md" && entry.name !== "skills-config.json")

  if (promptFiles.length === 0) {
    return {
      copied: [],
      overwritten: [],
      warnings: ["prompts ディレクトリにコピー対象のMarkdownファイルが見つかりません。"],
    }
  }

  const skillsConfig = await loadSkillsConfig(sourceDir)
  const copied: string[] = []
  const overwritten: string[] = []

  for (const entry of promptFiles) {
    const sourcePath = join(sourceDir, entry.name)
    
    // メタデータを取得
    let skillName: string
    let description: string
    
    if (skillsConfig && skillsConfig[entry.name]) {
      skillName = skillsConfig[entry.name].name
      description = skillsConfig[entry.name].description
    } else {
      // フォールバック: ファイル名から生成
      skillName = generateSkillNameFromFilename(entry.name)
      description = await extractDescriptionFromPrompt(sourcePath)
    }

    // スキルディレクトリを作成
    const skillDir = join(destinationDir, skillName)
    await mkdir(skillDir, { recursive: true })

    // SKILL.mdファイルのパス
    const skillMdPath = join(skillDir, "SKILL.md")

    // プロンプトファイルの内容を読み込み
    const promptContent = await readFile(sourcePath, "utf-8")

    // YAMLフロントマターを生成
    const yamlFrontMatter = generateYamlFrontMatter(skillName, description)

    // SKILL.mdファイルを作成
    const skillMdContent = yamlFrontMatter + promptContent

    if (existsSync(skillMdPath)) {
      await rm(skillMdPath, { force: true })
      overwritten.push(`${skillName}/SKILL.md`)
    }

    await writeFile(skillMdPath, skillMdContent, "utf-8")
    copied.push(`${skillName}/SKILL.md`)
  }

  return {
    copied,
    overwritten,
    warnings: [],
  }
}

import { copyFile, mkdir, readdir, rm, stat } from "fs/promises"
import { existsSync } from "fs"
import { basename, extname, join } from "path"
import { homedir } from "os"
import type { InstallPromptsOptions, InstallPromptsResult } from "../../types"
import { getProjectRoot } from "../../../../util/project-root"

const DEFAULT_CODEX_DEST_DIR = join(homedir(), ".codex", "prompts")
const DEFAULT_CLAUDE_CODE_DEST_DIR = join(homedir(), ".claude", "commands")
const DEFAULT_ROO_DEST_DIR = join(homedir(), ".roo", "commands")
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

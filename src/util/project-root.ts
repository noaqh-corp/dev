import { basename, dirname, join } from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"

export class ProjectRootNotFoundError extends Error {
  constructor(public readonly projectRootPath: string, options?: { cause?: unknown }) {
    super(`プロジェクトルートが見つかりません: ${projectRootPath}`, options)
    this.name = "ProjectRootNotFoundError"
  }
}

export function getProjectRoot(): string {
  // process.argv[1] は実行されたスクリプトのパス (bin/noaqh-dev)
  const scriptPath = process.argv[1]

  // bin/ ディレクトリから実行された場合
  if (scriptPath) {
    const scriptDir = dirname(scriptPath)
    if (basename(scriptDir) === "bin") {
      const projectRoot = join(scriptDir, "..")
      const packageJsonPath = join(projectRoot, "package.json")
      if (existsSync(packageJsonPath)) {
        return projectRoot
      }
    }
  }

  // フォールバック: 従来の import.meta.url ベースの方法
  // (テスト実行時やその他の実行パターン用)
  const currentFileUrl = import.meta.url
  const currentFilePath = fileURLToPath(currentFileUrl)
  const currentFileDir = dirname(currentFilePath)
  const projectRoot = join(currentFileDir, "..", "..")

  const packageJsonPath = join(projectRoot, "package.json")
  if (!existsSync(packageJsonPath)) {
    throw new ProjectRootNotFoundError(projectRoot)
  }

  return projectRoot
}

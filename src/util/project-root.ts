import { dirname } from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"
import { join } from "path"

export class ProjectRootNotFoundError extends Error {
  constructor(public readonly projectRootPath: string, options?: { cause?: unknown }) {
    super(`プロジェクトルートが見つかりません: ${projectRootPath}`, options)
    this.name = "ProjectRootNotFoundError"
  }
}

export function getProjectRoot(): string {
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


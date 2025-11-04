import { renderTemplate } from "../util"
import { readFileSync } from "fs"
import { getProjectRoot } from "../../../util/project-root"
import { join } from "path"

export const getArchitecture = async () => {
  const projectRoot = getProjectRoot()
  const architecturePath = join(projectRoot, "docs", "architecture.md")
  return readFileSync(architecturePath, "utf-8")
}

export const getSddPrompt = async () => {
  const projectRoot = getProjectRoot()
  const architecture = await getArchitecture()
  const templatePath = join(projectRoot, "template", "prompts", "sdd.md")
  return renderTemplate(templatePath, {
    architecture,
  })
}
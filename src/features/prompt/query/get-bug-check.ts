import { renderTemplate } from "../util"
import { getProjectRoot } from "../../../util/project-root"
import { join } from "path"

export const getBugCheckPrompt = async () => {
  const projectRoot = getProjectRoot()
  const templatePath = join(projectRoot, "template", "prompts", "bug-check.md")
  return renderTemplate(templatePath, {})
}
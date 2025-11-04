import { renderTemplate } from "../util"
import { readFileSync } from "fs"
import { getProjectRoot } from "../../../util/project-root"
import { join } from "path"

export const getCodeStyle = async () => {
  const projectRoot = getProjectRoot()
  const codeStylePath = join(projectRoot, "docs", "code-style.md")
  return readFileSync(codeStylePath, "utf-8")
}

export const getCodeStyleReviewPrompt = async () => {
  const projectRoot = getProjectRoot()
  const codeStyle = await getCodeStyle()
  const templatePath = join(projectRoot, "template", "prompts", "code-style-review.md")
  return renderTemplate(templatePath, {
    "code-style": codeStyle,
  })
}
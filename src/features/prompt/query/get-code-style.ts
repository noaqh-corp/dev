import { renderTemplate } from "../util"
import { readFileSync } from "fs"

export const getCodeStyle = async () => {
  return readFileSync("docs/code-style.md", "utf-8")
}

export const getCodeStyleReviewPrompt = async () => {
  const codeStyle = await getCodeStyle()
  return renderTemplate("template/prompts/code-style-review.md", {
    "code-style": codeStyle,
  })
}
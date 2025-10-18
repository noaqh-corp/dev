import { renderTemplate } from "../util"

export const getBugCheckPrompt = async () => {
  return renderTemplate("template/prompts/bug-check.md", {})
}
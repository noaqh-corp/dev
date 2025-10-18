import { renderTemplate } from "../util"
import { readFileSync } from "fs"

export const getArchitecture = async () => {
  return readFileSync("docs/architecture.md", "utf-8")
}

export const getSddPrompt = async () => {
  const architecture = await getArchitecture()
  return renderTemplate("template/prompts/sdd.md", {
    architecture,
  })
}
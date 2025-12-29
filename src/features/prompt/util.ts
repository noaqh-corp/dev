import { Ecto } from "ecto"
import { readFileSync } from "fs"
import { join } from "path"

export async function renderTemplate(
  templatePath: string,
  data: Record<string, string>
): Promise<string> {
  const template = readFileSync(templatePath, "utf-8")
  const ecto = new Ecto(data)
  return ecto.render(template)
}

export function replacePathPlaceholders(content: string, projectRoot: string): string {
  // まず、{{path("相対パス")}}プレースホルダーを絶対パスに変換
  const placeholderRegex = /\{\{path\("([^"]+)"\)\}\}/g
  let result = content.replace(placeholderRegex, (_, relativePath) => {
    return join(projectRoot, relativePath)
  })

  // 次に、GitHubのraw URLを絶対パスに変換
  // https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/docs/architecture.md
  // → /Users/.../dev_tool/docs/architecture.md
  const rawUrlRegex = /https:\/\/raw\.githubusercontent\.com\/noaqh-corp\/dev\/refs\/heads\/main\/([^)\s]+)/g
  result = result.replace(rawUrlRegex, (_, relativePath) => {
    return join(projectRoot, relativePath)
  })

  // GitHubのblob URLも絶対パスに変換
  // https://github.com/noaqh-corp/dev/blob/main/docs/architecture.md
  // → /Users/.../dev_tool/docs/architecture.md
  const blobUrlRegex = /https:\/\/github\.com\/noaqh-corp\/dev\/blob\/main\/([^)\s]+)/g
  result = result.replace(blobUrlRegex, (_, relativePath) => {
    return join(projectRoot, relativePath)
  })

  return result
}
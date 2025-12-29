import { promptGenerators } from "../src/features/prompt"
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs"
import { join } from "path"
import { getProjectRoot } from "../src/util/project-root"

/**
 * プレースホルダーをURLに変換する
 * {{path("相対パス")}} → https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/相対パス
 */
function replacePlaceholdersWithUrls(content: string): string {
  const placeholderRegex = /\{\{path\("([^"]+)"\)\}\}/g
  return content.replace(placeholderRegex, (_, relativePath) => {
    return `https://raw.githubusercontent.com/noaqh-corp/dev/refs/heads/main/${relativePath}`
  })
}

export async function generatePrompts() {
  const projectRoot = getProjectRoot()
  const templateDir = join(projectRoot, "template", "prompts")
  const outputDir = join(projectRoot, "prompts")

  // prompts ディレクトリを作成
  mkdirSync(outputDir, { recursive: true })

  // まず template/prompts からすべての .md ファイルをコピー（プレースホルダーをURLに変換）
  try {
    const templateFiles = readdirSync(templateDir)
    for (const file of templateFiles) {
      const sourcePath = join(templateDir, file)
      if (statSync(sourcePath).isFile() && file.endsWith(".md")) {
        const destPath = join(outputDir, file)
        const content = readFileSync(sourcePath, "utf-8")
        const convertedContent = replacePlaceholdersWithUrls(content)
        writeFileSync(destPath, convertedContent, "utf-8")
        console.log(`Copied from template: ${destPath}`)
      }
    }
  } catch (error) {
    console.warn(`Template directory not found: ${templateDir}`)
  }

  // 次に動的生成されるプロンプトで上書き
  for (const [filename, generator] of Object.entries(promptGenerators)) {
    const outputPath = join(outputDir, filename)
    const rendered = await generator()
    writeFileSync(outputPath, rendered, "utf-8")
    console.log(`Generated: ${outputPath}`)
  }
}

if (import.meta.main) {
  generatePrompts()
}
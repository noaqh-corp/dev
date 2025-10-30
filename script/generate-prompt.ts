import { promptGenerators } from "../src/features/prompt"
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

const TEMPLATE_DIR = "template/prompts"
const OUTPUT_DIR = "prompts"

export async function generatePrompts() {
  // prompts ディレクトリを作成
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // まず template/prompts からすべての .md ファイルをコピー
  try {
    const templateFiles = readdirSync(TEMPLATE_DIR)
    for (const file of templateFiles) {
      const sourcePath = join(TEMPLATE_DIR, file)
      if (statSync(sourcePath).isFile() && file.endsWith(".md")) {
        const destPath = join(OUTPUT_DIR, file)
        copyFileSync(sourcePath, destPath)
        console.log(`Copied from template: ${destPath}`)
      }
    }
  } catch (error) {
    console.warn(`Template directory not found: ${TEMPLATE_DIR}`)
  }

  // 次に動的生成されるプロンプトで上書き
  for (const [filename, generator] of Object.entries(promptGenerators)) {
    const outputPath = join(OUTPUT_DIR, filename)
    const rendered = await generator()
    writeFileSync(outputPath, rendered, "utf-8")
    console.log(`Generated: ${outputPath}`)
  }
}

if (import.meta.main) {
  generatePrompts()
}
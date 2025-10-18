import { promptGenerators } from "../src/features/prompt"
import { writeFileSync } from "fs"
import { join } from "path"

const OUTPUT_DIR = "prompts"

async function generatePrompts() {
  for (const [filename, generator] of Object.entries(promptGenerators)) {
    const outputPath = join(OUTPUT_DIR, filename)
    const rendered = await generator()
    writeFileSync(outputPath, rendered, "utf-8")
    console.log(`Generated: ${outputPath}`)
  }
}

generatePrompts()
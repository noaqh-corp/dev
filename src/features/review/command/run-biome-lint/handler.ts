import { spawn } from "child_process"
import { join } from "path"
import { existsSync } from "fs"
import type { BiomeLintResult } from "../../types"
import { getDevToolConfigPath } from "../../../../cli"

export async function runBiomeLint(files: string[], allFiles: boolean): Promise<BiomeLintResult> {
  const args = ["lint"]
  
  // config/review/biome.jsonが存在する場合はそれを使用
  const projectBiomeConfig = join(process.cwd(), "config", "review", "biome.json")
  const devToolBiomeConfig = getDevToolConfigPath("review/biome.json")
  
  let configPath: string | undefined
  if (existsSync(projectBiomeConfig)) {
    configPath = projectBiomeConfig
  } else if (existsSync(devToolBiomeConfig)) {
    configPath = devToolBiomeConfig
  }
  
  if (configPath) {
    args.push("--config-path", configPath)
  }
  
  if (allFiles) {
    args.push(".")
  } else {
    args.push(...files)
  }

  return new Promise((resolve, reject) => {
    const child = spawn("bunx", ["biome", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    child.stdout.setEncoding("utf-8")
    child.stderr.setEncoding("utf-8")

    child.stdout.on("data", (chunk) => {
      stdout += chunk
    })

    child.stderr.on("data", (chunk) => {
      stderr += chunk
    })

    child.on("error", (error) => {
      reject(error)
    })

    child.on("close", (code) => {
      const output = stdout + stderr
      
      // biome lintの出力からエラー数と警告数をパース
      // biome lintの出力形式: "Checked X files. Found Y errors and Z warnings."
      const errorMatch = output.match(/Found (\d+) error/i)
      const warningMatch = output.match(/(\d+) warning/i)
      
      const errorCount = errorMatch && errorMatch[1] ? parseInt(errorMatch[1], 10) : 0
      const warningCount = warningMatch && warningMatch[1] ? parseInt(warningMatch[1], 10) : 0
      
      const success = code === 0 && errorCount === 0

      resolve({
        success,
        output,
        errorCount,
        warningCount,
      })
    })
  })
}

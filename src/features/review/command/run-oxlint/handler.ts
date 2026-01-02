import { spawn } from "child_process"
import type { OxlintResult } from "../../types"

export async function runOxlint(files: string[], allFiles: boolean): Promise<OxlintResult> {
  // oxlintはプロジェクトルートのoxlintrc.jsonまたは.oxlintrc.jsonを自動的に検出する
  const args: string[] = []

  if (allFiles) {
    args.push(".")
  } else {
    args.push(...files)
  }

  return new Promise((resolve, reject) => {
    const child = spawn("bunx", ["oxlint", ...args], {
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

      // oxlintの出力からエラー数と警告数をパース
      // oxlintの出力形式: "Found X errors and Y warnings."
      const errorMatch = output.match(/Found (\d+) error/i)
      const warningMatch = output.match(/(\d+) warning/i)

      const errorCount = errorMatch?.[1] ? parseInt(errorMatch[1], 10) : 0
      const warningCount = warningMatch?.[1] ? parseInt(warningMatch[1], 10) : 0

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

import { spawn } from "child_process"
import { readFile } from "fs/promises"
import { join } from "path"
import { getDevToolConfigPath } from "../../../../cli"

async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, ["--version"], {
      stdio: ["ignore", "ignore", "ignore"],
    })

    const timeout = setTimeout(() => {
      child.kill()
      resolve(false)
    }, 1000)

    child.on("error", () => {
      clearTimeout(timeout)
      resolve(false)
    })

    child.on("close", (code) => {
      clearTimeout(timeout)
      resolve(code === 0)
    })
  })
}

async function getReviewPrompt(diffContent: string): Promise<string> {
  // まず現在の作業ディレクトリのconfig/review/prompt.mdを探す
  // 見つからない場合は、dev_toolのconfig/review/prompt.mdを使用
  let promptPath = join(process.cwd(), "config", "review", "prompt.md")
  let promptContent: string
  
  try {
    promptContent = await readFile(promptPath, "utf-8")
  } catch {
    // 現在のディレクトリにない場合は、dev_toolのconfig/review/prompt.mdを使用
    // cli.tsの位置から相対的に解決: src/cli.ts -> config/review/prompt.md
    promptPath = getDevToolConfigPath("review/prompt.md")
    promptContent = await readFile(promptPath, "utf-8")
  }
  
  return `${promptContent}

以下の差分コードをレビューしてください:

\`\`\`
${diffContent}
\`\`\`
`
}

export async function runClaudeReview(diffContent: string): Promise<string | null> {
  const exists = await commandExists("claude")
  if (!exists) {
    return null
  }

  const prompt = await getReviewPrompt(diffContent)
  
  return new Promise((resolve, reject) => {
    const child = spawn("claude", [
      "-p",
      prompt,
      "--allowedTools",
      "Read,Grep,Glob",
    ], {
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
      if (code === 0) {
        resolve(stdout)
      } else {
        // claudeコマンドが失敗した場合もnullを返す（スキップ扱い）
        resolve(null)
      }
    })
  })
}

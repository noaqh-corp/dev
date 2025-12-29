import { spawn } from "child_process"
import { readFile } from "fs/promises"
import { join } from "path"
import { getDevToolConfigPath } from "../../../../cli"

async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    // whichコマンドを使用してコマンドの存在を確認
    const child = spawn("which", [command], {
      stdio: ["ignore", "ignore", "ignore"],
      shell: false,
    })

    let resolved = false
    const resolveOnce = (value: boolean) => {
      if (!resolved) {
        resolved = true
        resolve(value)
      }
    }

    const timeout = setTimeout(() => {
      if (!resolved) {
        child.kill("SIGKILL")
        resolveOnce(false)
      }
    }, 300)

    child.on("error", () => {
      clearTimeout(timeout)
      resolveOnce(false)
    })

    child.on("close", (code) => {
      clearTimeout(timeout)
      resolveOnce(code === 0)
    })
  })
}

async function getReviewPrompt(base: string, uncommittedOnly: boolean): Promise<string> {
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
  
  // gitコマンドを実行するように指示
  let gitCommand: string
  if (uncommittedOnly) {
    // 未コミット分のみ: git diff + git diff --cached
    gitCommand = `git diff && git diff --cached`
  } else {
    // ブランチ差分+未コミット分: git diff {base}...HEAD + git diff + git diff --cached
    gitCommand = `git diff ${base}...HEAD && git diff && git diff --cached`
  }
  
  return `${promptContent}

以下のgitコマンドを実行して差分を取得し、その差分コードをレビューしてください:

\`\`\`bash
${gitCommand}
\`\`\`

このコマンドを実行して差分を確認してください。
`
}

export async function runClaudeReview(base: string, uncommittedOnly: boolean): Promise<string | null> {
  const exists = await commandExists("claude")
  if (!exists) {
    return null
  }

  const prompt = await getReviewPrompt(base, uncommittedOnly)
  
  return new Promise((resolve, reject) => {
    const child = spawn("claude", [
      "-p",
      prompt,
      "--allowedTools",
      "Read,Grep,Glob,Command",
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
        // claudeコマンドが失敗した場合
        // E2BIGエラーなど、差分が大きすぎる場合は警告を表示
        if (stderr.includes("E2BIG") || stderr.includes("argument list too long")) {
          console.error(`警告: 差分が大きすぎるため、Claude Codeレビューをスキップします。`)
          console.error(`エラー: ${stderr.trim()}`)
        }
        // その他のエラーもnullを返す（スキップ扱い）
        resolve(null)
      }
    })
  })
}

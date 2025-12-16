import { spawn } from "child_process"

export async function getDiffFiles(base: string, uncommittedOnly: boolean): Promise<string[]> {
  if (uncommittedOnly) {
    // 未コミット分のみ: git diff --name-only + git diff --cached --name-only
    const unstagedFiles = await getGitDiffFiles([])
    const stagedFiles = await getGitDiffFiles(["--cached"])
    const allFiles = [...unstagedFiles, ...stagedFiles]
    // 重複を除去
    return Array.from(new Set(allFiles))
  } else {
    // ブランチ差分+未コミット分: git diff --name-only {base}...HEAD + 未コミット分
    const branchDiffFiles = await getGitDiffFiles([`${base}...HEAD`])
    const uncommittedFiles = await getDiffFiles(base, true)
    const allFiles = [...branchDiffFiles, ...uncommittedFiles]
    // 重複を除去
    return Array.from(new Set(allFiles))
  }
}

export async function getDiffContent(base: string, uncommittedOnly: boolean): Promise<string> {
  if (uncommittedOnly) {
    // 未コミット分のみ: git diff + git diff --cached
    const unstagedContent = await getGitDiffContent([])
    const stagedContent = await getGitDiffContent(["--cached"])
    return unstagedContent + stagedContent
  } else {
    // ブランチ差分+未コミット分: git diff {base}...HEAD + 未コミット分
    const branchDiffContent = await getGitDiffContent([`${base}...HEAD`])
    const uncommittedContent = await getDiffContent(base, true)
    return branchDiffContent + uncommittedContent
  }
}

function getGitDiffFiles(args: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["diff", "--name-only", ...args], {
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
        const files = stdout
          .trim()
          .split("\n")
          .filter((file) => file.length > 0)
        resolve(files)
      } else {
        reject(new Error(`git diff failed: ${stderr}`))
      }
    })
  })
}

function getGitDiffContent(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["diff", ...args], {
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
        reject(new Error(`git diff failed: ${stderr}`))
      }
    })
  })
}

import { spawn } from "child_process"
import { resolve } from "path"
import type { CheckUpdateOptions, CheckUpdateResult } from "../types"
import { GitFetchError, GitReferenceError, GitRepositoryNotFoundError } from "../types"

type GitCommandResult = {
  stdout: string
  stderr: string
}

export async function checkForRemoteUpdate(options: CheckUpdateOptions = {}): Promise<CheckUpdateResult> {
  const cwd = resolve(options.cwd ?? process.cwd())
  const remote = options.remote ?? "origin"
  const branch = options.branch ?? "main"
  const remoteBranchRef = `${remote}/${branch}`

  await ensureGitRepository(cwd)
  await runGit(["fetch", remote, branch], cwd).catch((error) => {
    throw new GitFetchError(remote, branch, { cause: error })
  })

  await ensureReferenceExists(branch, cwd)
  await ensureReferenceExists(remoteBranchRef, cwd, true)

  const aheadCountOutput = await runGit(["rev-list", "--count", `${branch}..${remoteBranchRef}`], cwd)
  const aheadCount = parseInt(aheadCountOutput.stdout.trim(), 10)

  if (Number.isNaN(aheadCount)) {
    throw new Error(`git rev-list の結果を数値に変換できませんでした: ${aheadCountOutput.stdout}`)
  }

  return {
    aheadCount,
    targetBranch: branch,
    remoteBranch: remoteBranchRef,
  }
}

async function ensureGitRepository(cwd: string): Promise<void> {
  try {
    const { stdout } = await runGit(["rev-parse", "--is-inside-work-tree"], cwd)
    if (stdout.trim() !== "true") {
      throw new GitRepositoryNotFoundError(cwd)
    }
  } catch (error) {
    throw new GitRepositoryNotFoundError(cwd, { cause: error })
  }
}

async function ensureReferenceExists(ref: string, cwd: string, isRemote = false): Promise<void> {
  const refPath = isRemote ? `refs/remotes/${ref}` : `refs/heads/${ref}`
  try {
    await runGit(["show-ref", "--verify", "--quiet", refPath], cwd)
  } catch (error) {
    throw new GitReferenceError(ref, { cause: error })
  }
}

function runGit(args: string[], cwd: string): Promise<GitCommandResult> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("git", args, {
      cwd,
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
      rejectPromise(error)
    })

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr })
      } else {
        const error = new Error(`git ${args.join(" ")} failed with exit code ${code}`)
        ;(error as Error & { stdout?: string }).name = "GitCommandError"
        ;(error as Error & { stdout?: string }).message = stderr.trim() || error.message
        ;(error as Error & { stdout?: string }).stack = error.stack
        ;(error as Error & { stdout?: string }).stdout = stdout
        ;(error as Error & { stderr?: string }).stderr = stderr
        rejectPromise(error)
      }
    })
  })
}

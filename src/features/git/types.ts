export type CheckUpdateOptions = {
  cwd?: string
  remote?: string
  branch?: string
}

export type CheckUpdateResult = {
  aheadCount: number
  targetBranch: string
  remoteBranch: string
}

export class GitRepositoryNotFoundError extends Error {
  constructor(public readonly cwd: string, options?: { cause?: unknown }) {
    super(`Gitリポジトリが見つかりません: ${cwd}`, options)
    this.name = "GitRepositoryNotFoundError"
  }
}

export class GitFetchError extends Error {
  constructor(public readonly remote: string, public readonly branch: string, options?: { cause?: unknown }) {
    super(`git fetch ${remote} ${branch} に失敗しました。`, options)
    this.name = "GitFetchError"
  }
}

export class GitReferenceError extends Error {
  constructor(public readonly ref: string, options?: { cause?: unknown }) {
    super(`Gitリファレンスが見つかりません: ${ref}`, options)
    this.name = "GitReferenceError"
  }
}

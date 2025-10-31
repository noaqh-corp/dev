import process from "process"
import { installPrompts, installClaudeCodePrompts, PromptsSourceNotFoundError } from "./features/prompt/command/install-prompts/handler"
import {
  checkForRemoteUpdate,
  GitFetchError,
  GitReferenceError,
  GitRepositoryNotFoundError,
} from "./features/git/check-update"
import { generatePrompts } from "../script/generate-prompt"

const HELP_TEXT = `noaqh-dev CLI

Usage:
  noaqh-dev <command>

Commands:
  install             prompts ディレクトリのMarkdownを ~/.codex/prompts にコピーします
  install-claude      prompts ディレクトリのMarkdownを ~/.claude/commands にコピーします
  install-all         prompts ディレクトリのMarkdownを両方のディレクトリにコピーします
  check-update        リモート main の進捗を確認し、先行コミット数を表示します
  --help              このヘルプを表示します
`

type CliCommand = "install" | "install-claude" | "install-all" | "check-update" | "--help" | "-h"

export async function runCli(argv = process.argv): Promise<void> {
  const [, , ...rest] = argv
  const command = (rest[0] ?? "--help") as CliCommand

  switch (command) {
    case "--help":
    case "-h":
      printHelp()
      return
    case "install":
      await handleInstall()
      return
    case "install-claude":
      await handleInstallClaudeCode()
      return
    case "install-all":
      await handleInstallAll()
      return
    case "check-update":
      await handleCheckUpdate()
      return
    default:
      console.error(`未知のコマンドです: ${command}`)
      printHelp()
      process.exitCode = 1
  }
}

function printHelp(): void {
  process.stdout.write(HELP_TEXT)
}

async function handleInstall(): Promise<void> {
  try {
    // まずプロンプトを生成
    await generatePrompts()

    // 次にプロンプトをインストール
    const result = await installPrompts()

    for (const file of result.overwritten) {
      console.log(`上書き: ${file}`)
    }

    for (const file of result.copied) {
      if (!result.overwritten.includes(file)) {
        console.log(`コピー作成: ${file}`)
      }
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.warn(warning)
      }
    } else {
      console.log("プロンプトのインストールが完了しました。")
    }
  } catch (error) {
    if (error instanceof PromptsSourceNotFoundError) {
      console.error(error.message)
    } else if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }
    process.exitCode = 1
  }
}

async function handleInstallClaudeCode(): Promise<void> {
  try {
    // まずプロンプトを生成
    await generatePrompts()

    // 次にClaude Code用のプロンプトをインストール
    const result = await installClaudeCodePrompts()

    for (const file of result.overwritten) {
      console.log(`上書き: ${file}`)
    }

    for (const file of result.copied) {
      if (!result.overwritten.includes(file)) {
        console.log(`コピー作成: ${file}`)
      }
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.warn(warning)
      }
    } else {
      console.log("Claude Codeプロンプトのインストールが完了しました。")
    }
  } catch (error) {
    if (error instanceof PromptsSourceNotFoundError) {
      console.error(error.message)
    } else if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }
    process.exitCode = 1
  }
}

async function handleInstallAll(): Promise<void> {
  try {
    // まずプロンプトを生成
    await generatePrompts()

    // Codex用のプロンプトをインストール
    console.log("=== Codex用プロンプトのインストール ===")
    const codexResult = await installPrompts()

    for (const file of codexResult.overwritten) {
      console.log(`[Codex] 上書き: ${file}`)
    }

    for (const file of codexResult.copied) {
      if (!codexResult.overwritten.includes(file)) {
        console.log(`[Codex] コピー作成: ${file}`)
      }
    }

    // Claude Code用のプロンプトをインストール
    console.log("\n=== Claude Code用プロンプトのインストール ===")
    const claudeResult = await installClaudeCodePrompts()

    for (const file of claudeResult.overwritten) {
      console.log(`[Claude Code] 上書き: ${file}`)
    }

    for (const file of claudeResult.copied) {
      if (!claudeResult.overwritten.includes(file)) {
        console.log(`[Claude Code] コピー作成: ${file}`)
      }
    }

    const allWarnings = [...codexResult.warnings, ...claudeResult.warnings]
    if (allWarnings.length > 0) {
      for (const warning of allWarnings) {
        console.warn(warning)
      }
    } else {
      console.log("\nすべてのプロンプトのインストールが完了しました。")
    }
  } catch (error) {
    if (error instanceof PromptsSourceNotFoundError) {
      console.error(error.message)
    } else if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }
    process.exitCode = 1
  }
}

async function handleCheckUpdate(): Promise<void> {
  try {
    const result = await checkForRemoteUpdate()

    if (result.aheadCount > 0) {
      console.log(
        `リモート ${result.remoteBranch} がローカル ${result.targetBranch} より ${result.aheadCount} コミット先行しています。`,
      )
      console.log(`更新するには次を実行してください: cd ${process.cwd()} && git pull`)
    } else {
      console.log("リモート main に更新はありません。")
    }
  } catch (error) {
    if (error instanceof GitRepositoryNotFoundError) {
      console.error(error.message)
    } else if (error instanceof GitFetchError) {
      const causeMessage = error.cause instanceof Error ? error.cause.message : ""
      console.error(`${error.message}${causeMessage ? ` 詳細: ${causeMessage}` : ""}`)
    } else if (error instanceof GitReferenceError) {
      console.error(`${error.message} (git fetch 後にローカルの main ブランチが存在するか確認してください)`)
    } else if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }
    process.exitCode = 1
  }
}

if (import.meta.main) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

import process from "process"
import { spawn } from "child_process"
import { installPrompts, installClaudeCodePrompts, installRooPrompts, PromptsSourceNotFoundError } from "./features/prompt/command/install-prompts/handler"
import {
  checkForRemoteUpdate,
  GitFetchError,
  GitReferenceError,
  GitRepositoryNotFoundError,
} from "./features/git/check-update"
import { generatePrompts } from "../script/generate-prompt"

const HELP_TEXT = `noaqh-dev CLI

Usage:
  noaqh-dev <command> [options]

Commands:
  install-prompts     prompts ディレクトリのMarkdownをインストールします
                      オプションなし: すべてのディレクトリにコピーします
                      --codex: ~/.codex/prompts にコピーします
                      --claude: ~/.claude/commands にコピーします
                      --roo: ~/.roo/commands にコピーします
  install-mcp        CodexとClaude CodeにMCPサーバーを追加します
                      codexコマンドとclaudeコマンドが存在する場合のみ実行されます
  check-update        リモート main の進捗を確認し、先行コミット数を表示します
  --help              このヘルプを表示します
  --version           バージョンを表示します
`

type CliCommand = "install-prompts" | "install-mcp" | "check-update" | "--help" | "-h" | "--version"

export async function runCli(argv = process.argv): Promise<void> {
  const [, , ...rest] = argv
  const command = (rest[0] ?? "--help") as CliCommand

  switch (command) {
    case "--help":
    case "-h":
      printHelp()
      return
    case "install-prompts":
      await handleInstall(rest.slice(1))
      return
    case "install-mcp":
      await handleInstallMcp()
      return
    case "check-update":
      await handleCheckUpdate()
      return
    case "--version":
      const packageJson = await import("../package.json")
      console.log(`noaqh-dev v${packageJson.version}`)
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

async function handleInstall(args: string[]): Promise<void> {
  try {
    // まずプロンプトを生成
    await generatePrompts()

    // オプション引数の解析
    const hasCodex = args.includes("--codex")
    const hasClaude = args.includes("--claude")
    const hasRoo = args.includes("--roo")

    // オプションが指定されていない場合は全てにインストール
    const installAll = !hasCodex && !hasClaude && !hasRoo

    if (installAll || hasCodex) {
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

      if (codexResult.warnings.length > 0) {
        for (const warning of codexResult.warnings) {
          console.warn(`[Codex] ${warning}`)
        }
      }
    }

    if (installAll || hasClaude) {
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

      if (claudeResult.warnings.length > 0) {
        for (const warning of claudeResult.warnings) {
          console.warn(`[Claude Code] ${warning}`)
        }
      }
    }

    if (installAll || hasRoo) {
      console.log("\n=== Roo用プロンプトのインストール ===")
      const rooResult = await installRooPrompts()

      for (const file of rooResult.overwritten) {
        console.log(`[Roo] 上書き: ${file}`)
      }

      for (const file of rooResult.copied) {
        if (!rooResult.overwritten.includes(file)) {
          console.log(`[Roo] コピー作成: ${file}`)
        }
      }

      if (rooResult.warnings.length > 0) {
        for (const warning of rooResult.warnings) {
          console.warn(`[Roo] ${warning}`)
        }
      }
    }

    if (installAll) {
      console.log("\nすべてのプロンプトのインストールが完了しました。")
    } else {
      const targets = []
      if (hasCodex) targets.push("Codex")
      if (hasClaude) targets.push("Claude Code")
      if (hasRoo) targets.push("Roo")
      console.log(`\n${targets.join("、")}用プロンプトのインストールが完了しました。`)
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

async function handleInstallMcp(): Promise<void> {
  try {
    await addMcpServers()
  } catch (error) {
    if (error instanceof Error) {
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

async function addMcpServers(): Promise<void> {
  console.log("\n=== MCPサーバーの追加 ===")

  // codexコマンドの確認と実行
  if (await commandExists("codex")) {
    const isInstalled = await isMcpInstalled("codex")
    if (isInstalled) {
      console.log("[Codex] MCPサーバーは既にインストールされています。スキップします。")
    } else {
      console.log("[Codex] MCPサーバーを追加しています...")
      try {
        await runCommand("codex", ["mcp", "add", "noaqh-tool", "--url", "https://dev-tool.noaqh.com/mcp"])
        console.log("[Codex] MCPサーバーの追加が完了しました。")
      } catch (error) {
        console.warn(`[Codex] MCPサーバーの追加に失敗しました: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } else {
    console.log("[Codex] codexコマンドが見つかりませんでした。スキップします。")
  }

  // claudeコマンドの確認と実行
  if (await commandExists("claude")) {
    const isInstalled = await isMcpInstalled("claude")
    if (isInstalled) {
      console.log("[Claude Code] MCPサーバーは既にインストールされています。スキップします。")
    } else {
      console.log("[Claude Code] MCPサーバーを追加しています...")
      try {
        await runCommand("claude", ["mcp", "add", "--transport", "http", "noaqh-tool", "https://dev-tool.noaqh.com/mcp"])
        console.log("[Claude Code] MCPサーバーの追加が完了しました。")
      } catch (error) {
        console.warn(`[Claude Code] MCPサーバーの追加に失敗しました: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } else {
    console.log("[Claude Code] claudeコマンドが見つかりませんでした。スキップします。")
  }
}

async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, ["--version"], {
      stdio: ["ignore", "ignore", "ignore"],
    })

    child.on("error", () => {
      resolve(false)
    })

    child.on("close", (code) => {
      resolve(code === 0)
    })
  })
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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
        resolve()
      } else {
        const error = new Error(`コマンド実行に失敗しました: ${command} ${args.join(" ")}`)
        ;(error as Error & { stdout?: string }).stdout = stdout
        ;(error as Error & { stderr?: string }).stderr = stderr
        reject(error)
      }
    })
  })
}

async function isMcpInstalled(command: "codex" | "claude"): Promise<boolean> {
  return new Promise((resolve) => {
    const shellCommand = command === "codex"
      ? "codex mcp list | grep noaqh-tool | wc -l"
      : "claude mcp list | grep noaqh-tool | wc -l"

    const child = spawn("sh", ["-c", shellCommand], {
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""

    child.stdout.setEncoding("utf-8")
    child.stdout.on("data", (chunk) => {
      stdout += chunk
    })

    child.on("error", () => {
      resolve(false)
    })

    child.on("close", (code) => {
      if (code === 0) {
        const count = parseInt(stdout.trim(), 10)
        resolve(!isNaN(count) && count > 0)
      } else {
        resolve(false)
      }
    })
  })
}

if (import.meta.main) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

import { installPrompts } from "../src/features/prompt/command/install-prompts/handler.ts";

async function main(): Promise<void> {
  const result = await installPrompts();

  for (const file of result.overwritten) {
    console.log(`上書き: ${file}`);
  }

  for (const file of result.copied) {
    console.log(`コピー作成: ${file}`);
  }

  for (const warning of result.warnings) {
    console.warn(warning);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

import { getBugCheckPrompt } from "./query/get-bug-check"
import { getCodeStyleReviewPrompt } from "./query/get-code-style"
import { getSddPrompt } from "./query/get-sdd"

export const promptGenerators: Record<string, () => Promise<string>> = {
  "bug-check.md": getBugCheckPrompt,
  "code-style-review.md": getCodeStyleReviewPrompt,
}
import { Ecto } from "ecto"
import { readFileSync } from "fs"

export async function renderTemplate(
  templatePath: string,
  data: Record<string, string>
): Promise<string> {
  const template = readFileSync(templatePath, "utf-8")
  const ecto = new Ecto(data)
  return ecto.render(template)
}
export type InstallPromptsResult = {
  copied: string[]
  overwritten: string[]
  warnings: string[]
}

export type InstallPromptsOptions = {
  sourceDir?: string
  destinationDir?: string
  filePrefix?: string
}

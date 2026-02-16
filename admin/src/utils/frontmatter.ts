import { parse as parseYaml } from 'yaml'

interface ParsedFrontmatter {
  readonly data: Record<string, unknown>
  readonly body: string
}

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = FRONTMATTER_REGEX.exec(raw)
  if (!match) {
    return { data: {}, body: raw }
  }

  const [, yamlContent, body] = match
  const data = parseYaml(yamlContent ?? '') as Record<string, unknown>

  return {
    data: data ?? {},
    body: (body ?? '').trim(),
  }
}

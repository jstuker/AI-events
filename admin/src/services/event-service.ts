import type { Event } from '../types/event'
import { GITHUB_CONFIG } from '../config/github'
import { getTree, getBlob } from './github-api'
import { parseEventFile } from '../utils/event-parser'

const EVENT_FILE_PATTERN = new RegExp(
  `^${GITHUB_CONFIG.contentPath}/\\d{4}/\\d{2}/\\d{2}/[^/]+\\.md$`
)

function decodeBase64(encoded: string): string {
  // GitHub returns base64 with newlines
  const cleaned = encoded.replace(/\n/g, '')
  return decodeURIComponent(
    atob(cleaned)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

export async function fetchAllEvents(token: string): Promise<readonly Event[]> {
  const tree = await getTree(token)

  const eventFiles = tree.tree.filter(
    (item) => item.type === 'blob' && EVENT_FILE_PATTERN.test(item.path)
  )

  const BATCH_SIZE = 10
  const events: Event[] = []

  for (let i = 0; i < eventFiles.length; i += BATCH_SIZE) {
    const batch = eventFiles.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map(async (file) => {
        const blob = await getBlob(token, file.sha)
        const content = decodeBase64(blob.content)
        return parseEventFile(content, file.path)
      })
    )
    events.push(...results)
  }

  return events
}

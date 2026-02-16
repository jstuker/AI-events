import type { Event } from '../types/event'
import type { CommitEntry } from '../types/event-form'
import { getFileContent, updateFileContent, getFileCommits, getTree, getBlob } from './github-api'
import { parseEventFile } from '../utils/event-parser'
import { serializeEventFile } from '../utils/event-serializer'
import { GITHUB_CONFIG } from '../config/github'

interface EventWithSha {
  readonly event: Event
  readonly sha: string
}

function decodeBase64(encoded: string): string {
  const cleaned = encoded.replace(/\n/g, '')
  return decodeURIComponent(
    atob(cleaned)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

export async function fetchEventByPath(
  token: string,
  filePath: string,
): Promise<EventWithSha> {
  const file = await getFileContent(token, filePath)
  const content = decodeBase64(file.content)
  const event = parseEventFile(content, filePath)
  return { event, sha: file.sha }
}

export async function fetchEventById(
  token: string,
  eventId: string,
): Promise<EventWithSha> {
  const tree = await getTree(token)
  const pattern = new RegExp(
    `^${GITHUB_CONFIG.contentPath}/\\d{4}/\\d{2}/\\d{2}/[^/]+\\.md$`
  )
  const eventFiles = tree.tree.filter(
    (item) => item.type === 'blob' && pattern.test(item.path)
  )

  for (const file of eventFiles) {
    const blob = await getBlob(token, file.sha)
    const content = decodeBase64(blob.content)
    const event = parseEventFile(content, file.path)
    if (event.event_id === eventId) {
      const fileContent = await getFileContent(token, file.path)
      return { event, sha: fileContent.sha }
    }
  }

  throw new Error(`Event not found: ${eventId}`)
}

export async function saveEvent(
  token: string,
  event: Event,
  filePath: string,
  sha: string,
  message: string,
): Promise<EventWithSha> {
  const content = serializeEventFile(event)
  const result = await updateFileContent(token, filePath, content, message, sha)
  return {
    event,
    sha: result.content.sha,
  }
}

export async function fetchEventHistory(
  token: string,
  filePath: string,
): Promise<readonly CommitEntry[]> {
  const commits = await getFileCommits(token, filePath)
  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author.name,
    date: commit.commit.author.date,
    url: commit.html_url,
  }))
}

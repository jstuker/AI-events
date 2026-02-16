import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchEventByPath, fetchEventById, saveEvent, fetchEventHistory } from './event-detail-service'
import * as githubApi from './github-api'
import { createEvent, createTreeResponse, SAMPLE_FRONTMATTER } from '../test/fixtures'

vi.mock('./github-api')

const mockedGetFileContent = vi.mocked(githubApi.getFileContent)
const mockedUpdateFileContent = vi.mocked(githubApi.updateFileContent)
const mockedGetFileCommits = vi.mocked(githubApi.getFileCommits)
const mockedGetTree = vi.mocked(githubApi.getTree)
const mockedGetBlob = vi.mocked(githubApi.getBlob)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchEventByPath', () => {
  it('fetches and parses event file by path', async () => {
    const encoded = btoa(SAMPLE_FRONTMATTER)
    mockedGetFileContent.mockResolvedValue({
      sha: 'file-sha-123',
      content: encoded,
      encoding: 'base64',
      size: 200,
      name: 'evt-001.md',
      path: 'content/events/2026/03/15/evt-001.md',
    })

    const result = await fetchEventByPath('token', 'content/events/2026/03/15/evt-001.md')

    expect(result.sha).toBe('file-sha-123')
    expect(result.event.event_name).toBe('Zurich AI Hackathon')
    expect(mockedGetFileContent).toHaveBeenCalledWith('token', 'content/events/2026/03/15/evt-001.md')
  })
})

describe('fetchEventById', () => {
  it('scans tree to find event by ID', async () => {
    const tree = createTreeResponse([
      'content/events/2026/03/15/evt-001.md',
      'content/events/2026/04/10/evt-002.md',
    ])
    mockedGetTree.mockResolvedValue(tree)

    const content = '---\nevent_id: evt-002\nevent_name: Found It\n---\nBody'
    const encoded = btoa(content)

    mockedGetBlob.mockImplementation((_token, sha) => {
      if (sha === 'sha-content/events/2026/03/15/evt-001.md') {
        return Promise.resolve({
          sha: 'blob-1', node_id: 'n1', size: 100,
          url: 'http://test', content: btoa('---\nevent_id: evt-001\nevent_name: Not This\n---\n'), encoding: 'base64',
        })
      }
      return Promise.resolve({
        sha: 'blob-2', node_id: 'n2', size: 100,
        url: 'http://test', content: encoded, encoding: 'base64',
      })
    })

    mockedGetFileContent.mockResolvedValue({
      sha: 'file-sha-002',
      content: encoded,
      encoding: 'base64',
      size: 100,
      name: 'evt-002.md',
      path: 'content/events/2026/04/10/evt-002.md',
    })

    const result = await fetchEventById('token', 'evt-002')

    expect(result.event.event_name).toBe('Found It')
    expect(result.sha).toBe('file-sha-002')
  })

  it('throws when event not found', async () => {
    const tree = createTreeResponse(['content/events/2026/03/15/evt-001.md'])
    mockedGetTree.mockResolvedValue(tree)

    mockedGetBlob.mockResolvedValue({
      sha: 'blob-1', node_id: 'n1', size: 100,
      url: 'http://test', content: btoa('---\nevent_id: evt-001\n---\n'), encoding: 'base64',
    })

    await expect(fetchEventById('token', 'evt-999')).rejects.toThrow('Event not found: evt-999')
  })
})

describe('saveEvent', () => {
  it('serializes and saves event', async () => {
    const event = createEvent({ event_name: 'Updated Event' })
    mockedUpdateFileContent.mockResolvedValue({
      content: { sha: 'new-sha-456', path: event.filePath },
      commit: { sha: 'commit-sha', message: 'Update event' },
    })

    const result = await saveEvent('token', event, event.filePath, 'old-sha', 'Update event')

    expect(result.sha).toBe('new-sha-456')
    expect(result.event.event_name).toBe('Updated Event')
    expect(mockedUpdateFileContent).toHaveBeenCalledWith(
      'token',
      event.filePath,
      expect.stringContaining('event_name: Updated Event'),
      'Update event',
      'old-sha',
    )
  })
})

describe('fetchEventHistory', () => {
  it('maps commit entries', async () => {
    mockedGetFileCommits.mockResolvedValue([
      {
        sha: 'abc123',
        commit: {
          message: 'Initial commit',
          author: { name: 'Alice', date: '2026-01-15T10:00:00Z' },
        },
        html_url: 'https://github.com/test/repo/commit/abc123',
      },
      {
        sha: 'def456',
        commit: {
          message: 'Update event',
          author: { name: 'Bob', date: '2026-01-20T14:00:00Z' },
        },
        html_url: 'https://github.com/test/repo/commit/def456',
      },
    ])

    const history = await fetchEventHistory('token', 'content/events/2026/03/15/evt-001.md')

    expect(history).toHaveLength(2)
    expect(history[0]).toEqual({
      sha: 'abc123',
      message: 'Initial commit',
      author: 'Alice',
      date: '2026-01-15T10:00:00Z',
      url: 'https://github.com/test/repo/commit/abc123',
    })
    expect(history[1]!.author).toBe('Bob')
  })

  it('returns empty array for no commits', async () => {
    mockedGetFileCommits.mockResolvedValue([])

    const history = await fetchEventHistory('token', 'path/to/file.md')

    expect(history).toEqual([])
  })
})

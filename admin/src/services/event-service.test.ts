import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAllEvents } from './event-service'
import * as githubApi from './github-api'
import { createTreeResponse, createBlobResponse, SAMPLE_FRONTMATTER } from '../test/fixtures'

vi.mock('./github-api')

const mockedGetTree = vi.mocked(githubApi.getTree)
const mockedGetBlob = vi.mocked(githubApi.getBlob)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchAllEvents', () => {
  it('fetches and parses event files from repository', async () => {
    const tree = createTreeResponse([
      'content/events/2026/03/15/evt-001.md',
      'content/events/2026/04/10/evt-002.md',
      'README.md',
      'content/events/.gitkeep',
    ])
    mockedGetTree.mockResolvedValue(tree)

    const encoded = btoa(SAMPLE_FRONTMATTER)
    mockedGetBlob.mockResolvedValue(createBlobResponse(''))
    // Override with actual encoded content
    mockedGetBlob.mockImplementation(() =>
      Promise.resolve({
        sha: 'blob-sha',
        node_id: 'node-id',
        size: 100,
        url: 'https://api.github.com/test',
        content: encoded,
        encoding: 'base64',
      }),
    )

    const events = await fetchAllEvents('test-token')

    expect(mockedGetTree).toHaveBeenCalledWith('test-token')
    // Only 2 .md files match the event pattern, not README.md or .gitkeep
    expect(mockedGetBlob).toHaveBeenCalledTimes(2)
    expect(events).toHaveLength(2)
    expect(events[0]!.event_name).toBe('Zurich AI Hackathon')
  })

  it('returns empty array when no event files found', async () => {
    const tree = createTreeResponse(['README.md', 'hugo.toml'])
    mockedGetTree.mockResolvedValue(tree)

    const events = await fetchAllEvents('test-token')

    expect(events).toHaveLength(0)
    expect(mockedGetBlob).not.toHaveBeenCalled()
  })

  it('filters out non-event paths', async () => {
    const tree = createTreeResponse([
      'content/events/2026/03/15/evt-001.md',
      'content/events/index.md',
      'content/events/2026/summary.md',
      'content/pages/about.md',
    ])
    mockedGetTree.mockResolvedValue(tree)

    const encoded = btoa('---\nevent_name: Test\n---\n')
    mockedGetBlob.mockResolvedValue({
      sha: 'blob-sha',
      node_id: 'node-id',
      size: 100,
      url: 'https://api.github.com/test',
      content: encoded,
      encoding: 'base64',
    })

    const events = await fetchAllEvents('test-token')

    // Only content/events/YYYY/MM/DD/*.md should match
    expect(mockedGetBlob).toHaveBeenCalledTimes(1)
    expect(events).toHaveLength(1)
  })

  it('processes events in batches of 10', async () => {
    const paths = Array.from({ length: 15 }, (_, i) =>
      `content/events/2026/03/${String(i + 1).padStart(2, '0')}/evt-${i}.md`,
    )
    const tree = createTreeResponse(paths)
    mockedGetTree.mockResolvedValue(tree)

    const encoded = btoa('---\nevent_name: Test\n---\n')
    mockedGetBlob.mockResolvedValue({
      sha: 'blob-sha',
      node_id: 'node-id',
      size: 100,
      url: 'https://api.github.com/test',
      content: encoded,
      encoding: 'base64',
    })

    const events = await fetchAllEvents('test-token')

    expect(mockedGetBlob).toHaveBeenCalledTimes(15)
    expect(events).toHaveLength(15)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTree, getBlob } from './github-api'
import { createTreeResponse, createBlobResponse } from '../test/fixtures'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getTree', () => {
  it('fetches the repository tree with auth header', async () => {
    const treeData = createTreeResponse(['content/events/2026/03/15/evt-001.md'])
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(treeData),
    })

    const result = await getTree('test-token')

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toContain('/git/trees/main?recursive=1')
    expect(options.headers.Authorization).toBe('Bearer test-token')
    expect(result).toEqual(treeData)
  })

  it('throws on 401 unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })

    await expect(getTree('bad-token')).rejects.toThrow('GitHub API error: 401 Unauthorized')
  })

  it('throws on 404 not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    await expect(getTree('token')).rejects.toThrow('GitHub API error: 404 Not Found')
  })

  it('throws on 500 server error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(getTree('token')).rejects.toThrow('GitHub API error: 500 Internal Server Error')
  })
})

describe('getBlob', () => {
  it('fetches blob content by SHA', async () => {
    const blobData = createBlobResponse('test content')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(blobData),
    })

    const result = await getBlob('test-token', 'sha123')

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toContain('/git/blobs/sha123')
    expect(options.headers.Authorization).toBe('Bearer test-token')
    expect(result).toEqual(blobData)
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    })

    await expect(getBlob('token', 'sha123')).rejects.toThrow('GitHub API error: 403 Forbidden')
  })
})

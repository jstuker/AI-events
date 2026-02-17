import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadEventImage, previewUrl } from './image-upload-service'

vi.mock('./github-api', () => ({
  createFileContent: vi.fn(),
}))

import { createFileContent } from './github-api'
const mockCreateFileContent = vi.mocked(createFileContent)

function createMockFile(name: string, content = 'fake-image-data'): File {
  return new File([content], name, { type: 'image/jpeg' })
}

describe('uploadEventImage', () => {
  beforeEach(() => {
    mockCreateFileContent.mockReset()
  })

  it('uploads a 1x1 image and returns the public path', async () => {
    mockCreateFileContent.mockResolvedValue({
      content: { sha: 'abc123', path: 'static/images/events/evt-1/image-1x1.jpg' },
      commit: { sha: 'commit-sha', message: 'chore: upload 1x1 image for event evt-1' },
    })

    const file = createMockFile('photo.jpg')
    const result = await uploadEventImage(file, 'token-123', 'evt-1', '1x1')

    expect(result.path).toBe('/images/events/evt-1/image-1x1.jpg')
    expect(result.sha).toBe('abc123')
    expect(mockCreateFileContent).toHaveBeenCalledWith(
      'token-123',
      'static/images/events/evt-1/image-1x1.jpg',
      expect.any(String),
      'chore: upload 1x1 image for event evt-1',
    )
  })

  it('uploads a 16x9 image with correct filename', async () => {
    mockCreateFileContent.mockResolvedValue({
      content: { sha: 'def456', path: 'static/images/events/evt-2/image-16x9.png' },
      commit: { sha: 'commit-sha', message: 'chore: upload 16x9 image for event evt-2' },
    })

    const file = createMockFile('banner.png')
    const result = await uploadEventImage(file, 'token-456', 'evt-2', '16x9')

    expect(result.path).toBe('/images/events/evt-2/image-16x9.png')
    expect(result.sha).toBe('def456')
  })

  it('preserves file extension from original filename', async () => {
    mockCreateFileContent.mockResolvedValue({
      content: { sha: 'ghi789', path: 'static/images/events/evt-3/image-1x1.webp' },
      commit: { sha: 'commit-sha', message: 'chore: upload 1x1 image for event evt-3' },
    })

    const file = createMockFile('photo.WEBP')
    await uploadEventImage(file, 'token', 'evt-3', '1x1')

    expect(mockCreateFileContent).toHaveBeenCalledWith(
      'token',
      'static/images/events/evt-3/image-1x1.webp',
      expect.any(String),
      expect.any(String),
    )
  })

  it('defaults to jpg when file has no extension', async () => {
    mockCreateFileContent.mockResolvedValue({
      content: { sha: 'no-ext', path: 'static/images/events/evt-4/image-1x1.jpg' },
      commit: { sha: 'commit-sha', message: 'chore: upload 1x1 image for event evt-4' },
    })

    const file = new File(['data'], 'noext', { type: 'image/jpeg' })
    await uploadEventImage(file, 'token', 'evt-4', '1x1')

    expect(mockCreateFileContent).toHaveBeenCalledWith(
      'token',
      'static/images/events/evt-4/image-1x1.jpg',
      expect.any(String),
      expect.any(String),
    )
  })

  it('propagates errors from createFileContent', async () => {
    mockCreateFileContent.mockRejectedValue(new Error('GitHub API error: 422'))

    const file = createMockFile('photo.jpg')
    await expect(uploadEventImage(file, 'token', 'evt-5', '1x1'))
      .rejects.toThrow('GitHub API error: 422')
  })
})

describe('previewUrl', () => {
  it('builds raw githubusercontent URL from image path', () => {
    const url = previewUrl('/images/events/evt-1/image-1x1.jpg')
    expect(url).toBe(
      'https://raw.githubusercontent.com/jstuker/AI-events/main/static/images/events/evt-1/image-1x1.jpg',
    )
  })
})

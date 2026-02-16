import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bulkUpdateStatus } from './bulk-status-service'
import { createEvent } from '../test/fixtures'
import * as eventDetailService from './event-detail-service'

vi.mock('./event-detail-service')

const mockFetchEventByPath = vi.mocked(eventDetailService.fetchEventByPath)
const mockSaveEvent = vi.mocked(eventDetailService.saveEvent)

describe('bulkUpdateStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('updates events sequentially', async () => {
    const events = [
      createEvent({ event_id: 'evt-1', status: 'pending', event_name: 'Event 1' }),
      createEvent({ event_id: 'evt-2', status: 'pending', event_name: 'Event 2' }),
    ]

    mockFetchEventByPath.mockResolvedValue({ event: events[0], sha: 'sha-1' })
    mockSaveEvent.mockImplementation(async (_token, event) => ({
      event: { ...event, status: 'approved' } as eventDetailService extends never ? never : typeof event,
      sha: 'new-sha',
    }))

    const result = await bulkUpdateStatus('token', events, 'approved')
    expect(result.succeeded).toHaveLength(2)
    expect(result.failed).toHaveLength(0)
    expect(mockSaveEvent).toHaveBeenCalledTimes(2)
  })

  it('skips events with invalid transitions', async () => {
    const events = [
      createEvent({ event_id: 'evt-1', status: 'archived', event_name: 'Archived Event' }),
    ]

    const result = await bulkUpdateStatus('token', events, 'published')
    expect(result.succeeded).toHaveLength(0)
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('Cannot transition')
    expect(mockSaveEvent).not.toHaveBeenCalled()
  })

  it('handles save errors gracefully', async () => {
    const events = [
      createEvent({ event_id: 'evt-1', status: 'pending', event_name: 'Event 1' }),
    ]

    mockFetchEventByPath.mockResolvedValue({ event: events[0], sha: 'sha-1' })
    mockSaveEvent.mockRejectedValue(new Error('Conflict: the file has been modified'))

    const result = await bulkUpdateStatus('token', events, 'approved')
    expect(result.succeeded).toHaveLength(0)
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('Conflict')
  })

  it('generates correct commit messages', async () => {
    const events = [
      createEvent({ event_id: 'evt-1', status: 'pending', event_name: 'My Event' }),
    ]

    mockFetchEventByPath.mockResolvedValue({ event: events[0], sha: 'sha-1' })
    mockSaveEvent.mockImplementation(async (_token, event) => ({
      event,
      sha: 'new-sha',
    }))

    await bulkUpdateStatus('token', events, 'approved')
    expect(mockSaveEvent).toHaveBeenCalledWith(
      'token',
      expect.any(Object),
      events[0].filePath,
      'sha-1',
      'status: pending → approved — My Event',
    )
  })
})

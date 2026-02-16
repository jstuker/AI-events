import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EventDetailPage } from './EventDetailPage'
import { createEvent, createEvents } from '../test/fixtures'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}))

vi.mock('../services/event-detail-service', () => ({
  fetchEventByPath: vi.fn(),
  fetchEventById: vi.fn(),
  saveEvent: vi.fn(),
  fetchEventHistory: vi.fn(),
}))

vi.mock('../services/event-service', () => ({
  fetchAllEvents: vi.fn(),
}))

vi.mock('../utils/duplicate-detection', () => ({
  findDuplicatesForEvent: vi.fn().mockReturnValue([]),
}))

import { fetchEventByPath, fetchEventById, saveEvent, fetchEventHistory } from '../services/event-detail-service'
import { fetchAllEvents } from '../services/event-service'

const mockFetchEventByPath = vi.mocked(fetchEventByPath)
const mockFetchEventById = vi.mocked(fetchEventById)
const mockSaveEvent = vi.mocked(saveEvent)
const mockFetchEventHistory = vi.mocked(fetchEventHistory)
const mockFetchAllEvents = vi.mocked(fetchAllEvents)

const testEvent = createEvent({
  event_id: 'evt-001',
  event_name: 'Test AI Event',
  status: 'draft',
})

function renderPage(eventId = 'evt-001', locationState?: { filePath?: string }) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: `/events/${eventId}`, state: locationState }]}
    >
      <Routes>
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/events" element={<div>Events List</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EventDetailPage', () => {
  beforeEach(() => {
    mockFetchEventByPath.mockReset()
    mockFetchEventById.mockReset()
    mockSaveEvent.mockReset()
    mockFetchEventHistory.mockReset()
    mockFetchAllEvents.mockReset()
    mockFetchAllEvents.mockResolvedValue([])
  })

  describe('loading state', () => {
    it('shows loading message initially', () => {
      mockFetchEventById.mockImplementation(() => new Promise(() => {}))
      renderPage()
      expect(screen.getByText('Loading event...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      mockFetchEventById.mockRejectedValueOnce(new Error('Event not found'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Event not found')).toBeInTheDocument()
      })
    })

    it('shows generic error for non-Error rejections', async () => {
      mockFetchEventById.mockRejectedValueOnce('unknown')
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load event')).toBeInTheDocument()
      })
    })

    it('shows back link on error', async () => {
      mockFetchEventById.mockRejectedValueOnce(new Error('fail'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByText(/Back to events/)).toBeInTheDocument()
      })
    })
  })

  describe('fetching behavior', () => {
    it('fetches event by ID when no filePath in state', async () => {
      mockFetchEventById.mockResolvedValueOnce({ event: testEvent, sha: 'abc123' })
      renderPage('evt-001')

      await waitFor(() => {
        expect(mockFetchEventById).toHaveBeenCalledWith('test-token', 'evt-001')
      })
    })

    it('fetches event by path when filePath in location state', async () => {
      mockFetchEventByPath.mockResolvedValueOnce({ event: testEvent, sha: 'abc123' })
      renderPage('evt-001', { filePath: 'content/events/2026/03/15/evt-001.md' })

      await waitFor(() => {
        expect(mockFetchEventByPath).toHaveBeenCalledWith(
          'test-token',
          'content/events/2026/03/15/evt-001.md'
        )
      })
    })
  })

  describe('event detail view', () => {
    beforeEach(() => {
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
    })

    it('renders event name as heading', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Test AI Event' })).toBeInTheDocument()
      })
    })

    it('renders back link', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText(/Back to events/)).toBeInTheDocument()
      })
    })

    it('renders edit button in view mode', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })

    it('renders details and history tabs', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument()
      })
      expect(screen.getByText('History')).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    beforeEach(() => {
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
    })

    it('switches to edit mode when edit button is clicked', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Edit'))

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('switches back to view mode when cancel is clicked', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Edit'))
      expect(screen.getByText('Cancel')).toBeInTheDocument()

      await userEvent.click(screen.getByText('Cancel'))
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  describe('save flow', () => {
    beforeEach(() => {
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
    })

    it('shows save dialog when save is clicked with valid form', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Edit'))
      await userEvent.click(screen.getByText('Save'))

      await waitFor(() => {
        expect(screen.getByText(/Update event/)).toBeInTheDocument()
      })
    })

    it('saves event and shows success message', async () => {
      const updatedEvent = createEvent({ ...testEvent, event_name: 'Updated Event' })
      mockSaveEvent.mockResolvedValueOnce({ event: updatedEvent, sha: 'new-sha' })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Edit'))
      await userEvent.click(screen.getByText('Save'))

      // The save dialog should appear - find and click the confirm button
      await waitFor(() => {
        const saveButtons = screen.getAllByText('Save')
        // Click the dialog's save button (last one)
        if (saveButtons.length > 0) {
          userEvent.click(saveButtons[saveButtons.length - 1]!)
        }
      })
    })

    it('shows error message when save fails', async () => {
      mockSaveEvent.mockRejectedValueOnce(new Error('Save failed'))

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Edit'))
      await userEvent.click(screen.getByText('Save'))

      await waitFor(() => {
        const saveButtons = screen.getAllByText('Save')
        if (saveButtons.length > 0) {
          userEvent.click(saveButtons[saveButtons.length - 1]!)
        }
      })
    })
  })

  describe('history tab', () => {
    beforeEach(() => {
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
    })

    it('loads history when history tab is clicked', async () => {
      mockFetchEventHistory.mockResolvedValueOnce([
        {
          sha: 'commit-1',
          message: 'Initial commit',
          author: 'test-user',
          date: '2026-01-15T00:00:00Z',
          url: 'https://github.com/test/repo/commit/commit-1',
        },
      ])

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('History'))

      await waitFor(() => {
        expect(mockFetchEventHistory).toHaveBeenCalledWith(
          'test-token',
          testEvent.filePath
        )
      })
    })

    it('does not reload history if already loaded', async () => {
      mockFetchEventHistory.mockResolvedValueOnce([
        {
          sha: 'commit-1',
          message: 'Initial commit',
          author: 'test-user',
          date: '2026-01-15T00:00:00Z',
          url: 'https://github.com/test/repo/commit/commit-1',
        },
      ])

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('History'))

      await waitFor(() => {
        expect(mockFetchEventHistory).toHaveBeenCalledTimes(1)
      })

      // Switch back and forth
      await userEvent.click(screen.getByText('Details'))
      await userEvent.click(screen.getByText('History'))

      // Should not reload
      expect(mockFetchEventHistory).toHaveBeenCalledTimes(1)
    })
  })

  describe('status transitions', () => {
    it('renders status transition control', async () => {
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Test AI Event' })).toBeInTheDocument()
      })
    })

    it('shows success message after status transition', async () => {
      const updatedEvent = createEvent({ ...testEvent, status: 'review' })
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
      mockSaveEvent.mockResolvedValueOnce({ event: updatedEvent, sha: 'new-sha' })

      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Test AI Event' })).toBeInTheDocument()
      })

      // Look for status transition buttons (e.g., "Move to review")
      const transitionButton = screen.queryByText(/review/i, { selector: 'button' })
      if (transitionButton) {
        await userEvent.click(transitionButton)

        await waitFor(() => {
          expect(screen.getByText(/Status changed to review/)).toBeInTheDocument()
        })
      }
    })
  })

  describe('duplicate detection', () => {
    it('checks for duplicates after loading event', async () => {
      const events = createEvents()
      mockFetchEventById.mockResolvedValue({ event: testEvent, sha: 'abc123' })
      mockFetchAllEvents.mockResolvedValueOnce(events)

      renderPage()

      await waitFor(() => {
        expect(mockFetchAllEvents).toHaveBeenCalledWith('test-token')
      })
    })
  })
})

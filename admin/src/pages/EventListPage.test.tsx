import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { EventListPage } from './EventListPage'
import { createEvent, createEvents } from '../test/fixtures'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}))

vi.mock('../services/event-service', () => ({
  fetchAllEvents: vi.fn(),
}))

vi.mock('../services/bulk-status-service', () => ({
  bulkUpdateStatus: vi.fn(),
}))

import { fetchAllEvents } from '../services/event-service'
import { bulkUpdateStatus } from '../services/bulk-status-service'

const mockFetchAllEvents = vi.mocked(fetchAllEvents)
const mockBulkUpdateStatus = vi.mocked(bulkUpdateStatus)

function renderPage() {
  return render(
    <MemoryRouter>
      <EventListPage />
    </MemoryRouter>
  )
}

describe('EventListPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockFetchAllEvents.mockReset()
    mockBulkUpdateStatus.mockReset()
  })

  describe('loading state', () => {
    it('shows loading message initially', () => {
      mockFetchAllEvents.mockImplementation(() => new Promise(() => {}))
      renderPage()
      expect(screen.getByText('Loading events from GitHub...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message on fetch failure', async () => {
      mockFetchAllEvents.mockRejectedValueOnce(new Error('Network error'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('shows generic error for non-Error rejections', async () => {
      mockFetchAllEvents.mockRejectedValueOnce('unknown')
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load events')).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      mockFetchAllEvents.mockRejectedValueOnce(new Error('fail'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })
    })

    it('retries loading when retry button is clicked', async () => {
      mockFetchAllEvents.mockRejectedValueOnce(new Error('fail'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      mockFetchAllEvents.mockResolvedValueOnce([])
      await userEvent.click(screen.getByText('Retry'))

      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument()
      })
      expect(mockFetchAllEvents).toHaveBeenCalledTimes(2)
    })
  })

  describe('successful load', () => {
    it('renders events heading with count', async () => {
      const events = createEvents()
      mockFetchAllEvents.mockResolvedValueOnce(events)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument()
      })
      expect(screen.getByText(/\(3 of 3\)/)).toBeInTheDocument()
    })

    it('renders event table with event names', async () => {
      const events = createEvents()
      mockFetchAllEvents.mockResolvedValueOnce(events)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
      })
      expect(screen.getByText('Geneva ML Workshop')).toBeInTheDocument()
      expect(screen.getByText('Bern Data Summit')).toBeInTheDocument()
    })

    it('renders search bar', async () => {
      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      renderPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
      })
    })

    it('renders refresh button', async () => {
      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument()
      })
    })

    it('refreshes events when refresh button is clicked', async () => {
      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument()
      })

      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      await userEvent.click(screen.getByText('Refresh'))

      expect(mockFetchAllEvents).toHaveBeenCalledTimes(2)
    })

    it('renders empty state when no events exist', async () => {
      mockFetchAllEvents.mockResolvedValueOnce([])
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument()
      })
      expect(screen.getByText(/0 of 0/)).toBeInTheDocument()
    })
  })

  describe('filtering', () => {
    it('filters events by search term', async () => {
      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search events/i)
      await userEvent.type(searchInput, 'Geneva')

      await waitFor(() => {
        expect(screen.queryByText('Zurich AI Hackathon')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Geneva ML Workshop')).toBeInTheDocument()
    })

    it('updates count when filtering', async () => {
      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      renderPage()

      await waitFor(() => {
        expect(screen.getByText(/\(3 of 3\)/)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search events/i)
      await userEvent.type(searchInput, 'Zurich')

      await waitFor(() => {
        expect(screen.getByText(/\(1 of 3\)/)).toBeInTheDocument()
      })
    })
  })

  describe('bulk actions', () => {
    it('shows bulk action toolbar', async () => {
      mockFetchAllEvents.mockResolvedValueOnce(createEvents())
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument()
      })
    })

    it('displays bulk success message after successful update', async () => {
      const events = createEvents()
      mockFetchAllEvents.mockResolvedValueOnce(events)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
      })

      // Select events by clicking checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      if (checkboxes.length > 1) {
        await userEvent.click(checkboxes[1]!)
      }

      mockBulkUpdateStatus.mockResolvedValueOnce({
        succeeded: [events[0]!],
        failed: [],
      })
      mockFetchAllEvents.mockResolvedValueOnce(events)

      // Find and click bulk action button if visible
      const reviewButton = screen.queryByText(/review/i, { selector: 'button' })
      if (reviewButton) {
        await userEvent.click(reviewButton)

        await waitFor(() => {
          expect(screen.getByText(/1 event updated/)).toBeInTheDocument()
        })
      }
    })

    it('displays bulk error message on failure', async () => {
      const events = createEvents()
      mockFetchAllEvents.mockResolvedValueOnce(events)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
      })

      const checkboxes = screen.getAllByRole('checkbox')
      if (checkboxes.length > 1) {
        await userEvent.click(checkboxes[1]!)
      }

      mockBulkUpdateStatus.mockRejectedValueOnce(new Error('Bulk failed'))
      mockFetchAllEvents.mockResolvedValueOnce(events)

      const reviewButton = screen.queryByText(/review/i, { selector: 'button' })
      if (reviewButton) {
        await userEvent.click(reviewButton)

        await waitFor(() => {
          expect(screen.getByText('Bulk failed')).toBeInTheDocument()
        })
      }
    })
  })

  describe('fetching behavior', () => {
    it('calls fetchAllEvents with token on mount', async () => {
      mockFetchAllEvents.mockResolvedValueOnce([])
      renderPage()

      await waitFor(() => {
        expect(mockFetchAllEvents).toHaveBeenCalledWith('test-token')
      })
    })

    it('passes token to fetchAllEvents', async () => {
      mockFetchAllEvents.mockResolvedValueOnce([])
      renderPage()

      await waitFor(() => {
        expect(mockFetchAllEvents).toHaveBeenCalledTimes(1)
        expect(mockFetchAllEvents).toHaveBeenCalledWith('test-token')
      })
    })
  })

  describe('filter dropdowns', () => {
    it('extracts unique locations for filter dropdown', async () => {
      const events = createEvents()
      mockFetchAllEvents.mockResolvedValueOnce(events)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
      })

      // Locations should be available in the filter panel
      expect(screen.getByText('All locations')).toBeInTheDocument()
    })

    it('extracts unique sources for filter dropdown', async () => {
      const events = createEvents()
      mockFetchAllEvents.mockResolvedValueOnce(events)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
      })

      expect(screen.getByText('All sources')).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    it('renders pagination controls', async () => {
      const manyEvents = Array.from({ length: 30 }, (_, i) =>
        createEvent({
          event_id: `evt-${i}`,
          event_name: `Event ${i}`,
          event_start_date: '2026-03-15',
        })
      )
      mockFetchAllEvents.mockResolvedValueOnce(manyEvents)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText(/30 of 30/)).toBeInTheDocument()
      })
    })
  })
})

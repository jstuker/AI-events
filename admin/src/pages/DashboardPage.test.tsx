import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'
import { createEvent } from '../test/fixtures'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}))

vi.mock('../services/event-service', () => ({
  fetchAllEvents: vi.fn(),
}))

import { fetchAllEvents } from '../services/event-service'

const mockFetchAllEvents = vi.mocked(fetchAllEvents)

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockFetchAllEvents.mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('shows error state with retry button', async () => {
    mockFetchAllEvents.mockRejectedValueOnce(new Error('Network error'))
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('renders stat cards after loading events', async () => {
    const events = [
      createEvent({ event_id: '1', status: 'published', event_start_date: '2099-01-01' }),
      createEvent({ event_id: '2', status: 'review', event_start_date: '2099-02-01' }),
      createEvent({ event_id: '3', status: 'pending', event_start_date: '2099-03-01' }),
    ]
    mockFetchAllEvents.mockResolvedValueOnce(events)
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Duplicates')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
  })

  it('renders review queue when review/pending events exist', async () => {
    const events = [
      createEvent({ event_id: '1', status: 'review', event_name: 'Review Event' }),
    ]
    mockFetchAllEvents.mockResolvedValueOnce(events)
    renderDashboard()

    await waitFor(() => {
      // Event appears in both Review Queue and Upcoming Events tables
      expect(screen.getAllByText('Review Event')).toHaveLength(2)
    })
    // Section heading + quick action link
    const reviewQueueElements = screen.getAllByText('Review Queue')
    expect(reviewQueueElements).toHaveLength(2)
  })

  it('renders upcoming events section', async () => {
    const events = [
      createEvent({
        event_id: '1',
        status: 'published',
        event_name: 'Future Event',
        event_start_date: '2099-06-01',
      }),
    ]
    mockFetchAllEvents.mockResolvedValueOnce(events)
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
    })
    expect(screen.getByText('Future Event')).toBeInTheDocument()
  })

  it('renders quick action links', async () => {
    mockFetchAllEvents.mockResolvedValueOnce([])
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('View All Events')).toBeInTheDocument()
    })
    expect(screen.getByText('Review Queue')).toBeInTheDocument()

    const allEventsLink = screen.getByRole('link', { name: 'View All Events' })
    expect(allEventsLink).toHaveAttribute('href', '/events')

    const reviewLink = screen.getByRole('link', { name: 'Review Queue' })
    expect(reviewLink).toHaveAttribute('href', '/events?status=review')
  })

  it('shows duplicates panel when duplicate events exist', async () => {
    const events = [
      createEvent({
        event_id: '1',
        event_name: 'Zurich AI Hackathon',
        event_start_date: '2099-06-15',
        location_name: 'Zurich',
      }),
      createEvent({
        event_id: '2',
        event_name: 'Zürich AI Hackathon',
        event_start_date: '2099-06-15',
        location_name: 'Zurich',
      }),
    ]
    mockFetchAllEvents.mockResolvedValueOnce(events)
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Potential Duplicates/)).toBeInTheDocument()
    })
  })

  it('hides review queue section when no review/pending events', async () => {
    const events = [
      createEvent({ event_id: '1', status: 'published' }),
    ]
    mockFetchAllEvents.mockResolvedValueOnce(events)
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
    // "Review Queue" should only appear as a quick action link, not as a section heading
    const reviewQueueElements = screen.getAllByText('Review Queue')
    expect(reviewQueueElements).toHaveLength(1) // only the quick action link
  })
})

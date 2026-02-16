import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UpcomingEventsTable } from './UpcomingEventsTable'
import { createEvent } from '../../test/fixtures'

function renderTable(props: Parameters<typeof UpcomingEventsTable>[0]) {
  return render(
    <MemoryRouter>
      <UpcomingEventsTable {...props} />
    </MemoryRouter>
  )
}

describe('UpcomingEventsTable', () => {
  it('renders the title', () => {
    renderTable({ events: [], title: 'Upcoming Events' })

    expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
  })

  it('shows empty message when no events', () => {
    renderTable({ events: [], title: 'Upcoming Events' })

    expect(screen.getByText('No upcoming events')).toBeInTheDocument()
  })

  it('renders event rows with name, date, location, and status', () => {
    const events = [
      createEvent({
        event_id: 'evt-1',
        event_name: 'AI Workshop',
        event_start_date: '2026-03-15',
        location_name: 'Zurich',
        status: 'published',
      }),
    ]
    renderTable({ events, title: 'Upcoming' })

    expect(screen.getByText('AI Workshop')).toBeInTheDocument()
    expect(screen.getByText('2026-03-15')).toBeInTheDocument()
    expect(screen.getByText('Zurich')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('links event names to detail pages', () => {
    const events = [
      createEvent({ event_id: 'evt-42', event_name: 'Test Event' }),
    ]
    renderTable({ events, title: 'Events' })

    const link = screen.getByRole('link', { name: 'Test Event' })
    expect(link).toHaveAttribute('href', '/events/evt-42')
  })

  it('renders multiple events', () => {
    const events = [
      createEvent({ event_id: '1', event_name: 'Event A' }),
      createEvent({ event_id: '2', event_name: 'Event B' }),
      createEvent({ event_id: '3', event_name: 'Event C' }),
    ]
    renderTable({ events, title: 'Events' })

    expect(screen.getByText('Event A')).toBeInTheDocument()
    expect(screen.getByText('Event B')).toBeInTheDocument()
    expect(screen.getByText('Event C')).toBeInTheDocument()
  })

  it('does not render table when events list is empty', () => {
    renderTable({ events: [], title: 'Events' })

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

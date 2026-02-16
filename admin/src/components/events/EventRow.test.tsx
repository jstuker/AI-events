import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EventRow } from './EventRow'
import { createEvent } from '../../test/fixtures'

function renderInTable(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <table>
        <tbody>{ui}</tbody>
      </table>
    </MemoryRouter>,
  )
}

describe('EventRow', () => {
  it('renders event name as link', () => {
    const event = createEvent({ event_name: 'AI Summit 2026', event_id: 'evt-001' })
    renderInTable(<EventRow event={event} />)
    const link = screen.getByText('AI Summit 2026')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/events/evt-001')
  })

  it('renders formatted start date', () => {
    const event = createEvent({ event_start_date: '2026-03-15' })
    renderInTable(<EventRow event={event} />)
    expect(screen.getByText(/15 Mar 2026/)).toBeInTheDocument()
  })

  it('renders dash for empty start date', () => {
    const event = createEvent({ event_start_date: '' })
    renderInTable(<EventRow event={event} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('renders location name', () => {
    const event = createEvent({ location_name: 'Zurich' })
    renderInTable(<EventRow event={event} />)
    expect(screen.getByText('Zurich')).toBeInTheDocument()
  })

  it('renders dash for empty location', () => {
    const event = createEvent({ location_name: '' })
    renderInTable(<EventRow event={event} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('renders organizer name', () => {
    const event = createEvent({ organizer_name: 'SwissAI' })
    renderInTable(<EventRow event={event} />)
    expect(screen.getByText('SwissAI')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    const event = createEvent({ status: 'published' })
    renderInTable(<EventRow event={event} />)
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('renders "Yes" for featured events', () => {
    const event = createEvent({ featured: true, featured_type: 'badge' })
    renderInTable(<EventRow event={event} />)
    const yes = screen.getByText('Yes')
    expect(yes).toBeInTheDocument()
    expect(yes).toHaveAttribute('title', 'badge')
  })

  it('renders dash for non-featured events', () => {
    const event = createEvent({ featured: false })
    renderInTable(<EventRow event={event} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('renders source', () => {
    const event = createEvent({ source: 'manual' })
    renderInTable(<EventRow event={event} />)
    expect(screen.getByText('manual')).toBeInTheDocument()
  })
})

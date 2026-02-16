import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { EventTable } from './EventTable'
import { createEvents } from '../../test/fixtures'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('EventTable', () => {
  const events = createEvents()
  const defaultProps = {
    events,
    sortField: 'event_start_date' as const,
    sortDirection: 'asc' as const,
    onSort: vi.fn(),
  }

  it('renders empty state when no events', () => {
    renderWithRouter(<EventTable {...defaultProps} events={[]} />)
    expect(screen.getByText(/no events found/i)).toBeInTheDocument()
  })

  it('renders event rows for each event', () => {
    renderWithRouter(<EventTable {...defaultProps} />)
    expect(screen.getByText('Zurich AI Hackathon')).toBeInTheDocument()
    expect(screen.getByText('Geneva ML Workshop')).toBeInTheDocument()
    expect(screen.getByText('Bern Data Summit')).toBeInTheDocument()
  })

  it('renders sortable column headers', () => {
    renderWithRouter(<EventTable {...defaultProps} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('calls onSort when clicking a sortable header', async () => {
    const onSort = vi.fn()
    renderWithRouter(<EventTable {...defaultProps} onSort={onSort} />)

    await userEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('event_name')
  })

  it('renders a table element', () => {
    renderWithRouter(<EventTable {...defaultProps} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})

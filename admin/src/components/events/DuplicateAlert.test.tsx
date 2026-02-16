import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DuplicateAlert } from './DuplicateAlert'
import { createEvent } from '../../test/fixtures'
import type { DuplicateMatch } from '../../utils/duplicate-detection'

function createMatch(overrides: Partial<DuplicateMatch> = {}): DuplicateMatch {
  return {
    event: createEvent({ event_id: 'source' }),
    matchedEvent: createEvent({
      event_id: 'dup-1',
      event_name: 'Duplicate Event',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
      status: 'review',
    }),
    score: 0.85,
    reasons: ['Similar name', 'Same location'],
    ...overrides,
  }
}

function renderAlert(matches: readonly DuplicateMatch[]) {
  return render(
    <MemoryRouter>
      <DuplicateAlert matches={matches} />
    </MemoryRouter>
  )
}

describe('DuplicateAlert', () => {
  it('renders nothing when no matches', () => {
    const { container } = renderAlert([])
    expect(container.innerHTML).toBe('')
  })

  it('shows the number of potential duplicates', () => {
    const matches = [createMatch(), createMatch({
      matchedEvent: createEvent({ event_id: 'dup-2', event_name: 'Another Dup' }),
    })]
    renderAlert(matches)

    expect(screen.getByText('Potential Duplicates (2)')).toBeInTheDocument()
  })

  it('displays matched event name as a link', () => {
    renderAlert([createMatch()])

    const link = screen.getByRole('link', { name: 'Duplicate Event' })
    expect(link).toHaveAttribute('href', '/events/dup-1')
  })

  it('shows match score percentage', () => {
    renderAlert([createMatch({ score: 0.85 })])

    expect(screen.getByText('85% match')).toBeInTheDocument()
  })

  it('shows match reasons', () => {
    renderAlert([createMatch({ reasons: ['Similar name', 'Same location'] })])

    expect(screen.getByText('Similar name, Same location')).toBeInTheDocument()
  })

  it('shows event date and location', () => {
    renderAlert([createMatch()])

    expect(screen.getByText(/2026-06-15/)).toBeInTheDocument()
    expect(screen.getByText(/Zurich/)).toBeInTheDocument()
  })

  it('shows status badge', () => {
    renderAlert([createMatch()])

    expect(screen.getByText('review')).toBeInTheDocument()
  })

  it('dismisses a match when clicking dismiss', async () => {
    const user = userEvent.setup()
    renderAlert([createMatch()])

    expect(screen.getByText('Duplicate Event')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Dismiss Duplicate Event'))

    expect(screen.queryByText('Duplicate Event')).not.toBeInTheDocument()
  })

  it('hides entire alert when all matches dismissed', async () => {
    const user = userEvent.setup()
    const { container } = renderAlert([createMatch()])

    await user.click(screen.getByLabelText('Dismiss Duplicate Event'))

    expect(container.innerHTML).toBe('')
  })
})

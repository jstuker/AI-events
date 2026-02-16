import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DuplicatesPanel } from './DuplicatesPanel'
import { createEvent } from '../../test/fixtures'
import type { DuplicateGroup } from '../../utils/duplicate-detection'

function renderPanel(groups: readonly DuplicateGroup[]) {
  return render(
    <MemoryRouter>
      <DuplicatesPanel groups={groups} />
    </MemoryRouter>
  )
}

describe('DuplicatesPanel', () => {
  it('renders nothing when no groups', () => {
    const { container } = renderPanel([])
    expect(container.innerHTML).toBe('')
  })

  it('shows group count in header', () => {
    const groups: DuplicateGroup[] = [
      {
        events: [
          createEvent({ event_id: '1', event_name: 'Event A' }),
          createEvent({ event_id: '2', event_name: 'Event B' }),
        ],
        score: 0.8,
        reasons: ['Similar name'],
      },
    ]
    renderPanel(groups)

    expect(screen.getByText('Potential Duplicates (1 group)')).toBeInTheDocument()
  })

  it('uses plural for multiple groups', () => {
    const groups: DuplicateGroup[] = [
      {
        events: [
          createEvent({ event_id: '1', event_name: 'Event A' }),
          createEvent({ event_id: '2', event_name: 'Event B' }),
        ],
        score: 0.8,
        reasons: ['Similar name'],
      },
      {
        events: [
          createEvent({ event_id: '3', event_name: 'Event C' }),
          createEvent({ event_id: '4', event_name: 'Event D' }),
        ],
        score: 0.6,
        reasons: ['Same location'],
      },
    ]
    renderPanel(groups)

    expect(screen.getByText('Potential Duplicates (2 groups)')).toBeInTheDocument()
  })

  it('renders event names as links', () => {
    const groups: DuplicateGroup[] = [
      {
        events: [
          createEvent({ event_id: 'evt-1', event_name: 'AI Hackathon' }),
          createEvent({ event_id: 'evt-2', event_name: 'AI Hackathon Zurich' }),
        ],
        score: 0.85,
        reasons: ['Similar name'],
      },
    ]
    renderPanel(groups)

    const link1 = screen.getByRole('link', { name: 'AI Hackathon' })
    expect(link1).toHaveAttribute('href', '/events/evt-1')

    const link2 = screen.getByRole('link', { name: 'AI Hackathon Zurich' })
    expect(link2).toHaveAttribute('href', '/events/evt-2')
  })

  it('shows match score and reasons', () => {
    const groups: DuplicateGroup[] = [
      {
        events: [
          createEvent({ event_id: '1' }),
          createEvent({ event_id: '2' }),
        ],
        score: 0.75,
        reasons: ['Similar name', 'Same location'],
      },
    ]
    renderPanel(groups)

    expect(screen.getByText('75% match')).toBeInTheDocument()
    expect(screen.getByText('Similar name, Same location')).toBeInTheDocument()
  })

  it('shows status badges for events', () => {
    const groups: DuplicateGroup[] = [
      {
        events: [
          createEvent({ event_id: '1', status: 'review' }),
          createEvent({ event_id: '2', status: 'published' }),
        ],
        score: 0.8,
        reasons: ['Similar name'],
      },
    ]
    renderPanel(groups)

    expect(screen.getByText('review')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
  })
})

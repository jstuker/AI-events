import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventHistory } from './EventHistory'
import type { CommitEntry } from '../../types/event-form'

const sampleCommits: readonly CommitEntry[] = [
  {
    sha: 'abc123def456',
    message: 'Initial event creation',
    author: 'Alice',
    date: '2026-01-15T10:00:00Z',
    url: 'https://github.com/test/repo/commit/abc123def456',
  },
  {
    sha: 'def456ghi789',
    message: 'Update event details',
    author: 'Bob',
    date: '2026-01-20T14:00:00Z',
    url: 'https://github.com/test/repo/commit/def456ghi789',
  },
]

describe('EventHistory', () => {
  it('renders loading state', () => {
    render(<EventHistory commits={[]} isLoading={true} />)
    expect(screen.getByText('Loading history...')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<EventHistory commits={[]} isLoading={false} />)
    expect(screen.getByText('No commit history found.')).toBeInTheDocument()
  })

  it('renders commit messages', () => {
    render(<EventHistory commits={sampleCommits} isLoading={false} />)
    expect(screen.getByText('Initial event creation')).toBeInTheDocument()
    expect(screen.getByText('Update event details')).toBeInTheDocument()
  })

  it('renders author names', () => {
    render(<EventHistory commits={sampleCommits} isLoading={false} />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
  })

  it('renders short SHA as link', () => {
    render(<EventHistory commits={sampleCommits} isLoading={false} />)
    const link = screen.getByText('abc123d')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/test/repo/commit/abc123def456')
    expect(link.closest('a')).toHaveAttribute('target', '_blank')
  })
})

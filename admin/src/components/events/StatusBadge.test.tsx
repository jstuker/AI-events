import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'
import type { EventStatus } from '../../types/event'

describe('StatusBadge', () => {
  const statuses: readonly EventStatus[] = [
    'draft',
    'review',
    'pending',
    'approved',
    'published',
    'archived',
  ]

  it.each(statuses)('renders "%s" status text', (status) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('applies correct class for published status', () => {
    render(<StatusBadge status="published" />)
    const badge = screen.getByText('published')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-800')
  })

  it('applies correct class for draft status', () => {
    render(<StatusBadge status="draft" />)
    const badge = screen.getByText('draft')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-700')
  })

  it('applies correct class for review status', () => {
    render(<StatusBadge status="review" />)
    const badge = screen.getByText('review')
    expect(badge.className).toContain('bg-yellow-100')
  })

  it('applies correct class for pending status', () => {
    render(<StatusBadge status="pending" />)
    const badge = screen.getByText('pending')
    expect(badge.className).toContain('bg-orange-100')
  })

  it('applies correct class for approved status', () => {
    render(<StatusBadge status="approved" />)
    const badge = screen.getByText('approved')
    expect(badge.className).toContain('bg-blue-100')
  })

  it('applies correct class for archived status', () => {
    render(<StatusBadge status="archived" />)
    const badge = screen.getByText('archived')
    expect(badge.className).toContain('bg-gray-200')
  })

  it('renders as a span with capitalize class', () => {
    render(<StatusBadge status="published" />)
    const badge = screen.getByText('published')
    expect(badge.tagName).toBe('SPAN')
    expect(badge.className).toContain('capitalize')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StatCard } from './StatCard'

function renderStatCard(props: {
  label: string
  value: number
  highlight?: boolean
  linkTo?: string
}) {
  return render(
    <MemoryRouter>
      <StatCard {...props} />
    </MemoryRouter>
  )
}

describe('StatCard', () => {
  it('renders value and label', () => {
    renderStatCard({ label: 'Total Events', value: 42 })

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Total Events')).toBeInTheDocument()
  })

  it('uses default styling without highlight', () => {
    renderStatCard({ label: 'Events', value: 5 })

    const card = screen.getByText('5').closest('div')
    expect(card?.className).toContain('bg-white')
    expect(card?.className).toContain('border-gray-200')
  })

  it('uses amber styling when highlighted', () => {
    renderStatCard({ label: 'Pending', value: 3, highlight: true })

    const card = screen.getByText('3').closest('div')
    expect(card?.className).toContain('bg-amber-50')
    expect(card?.className).toContain('border-amber-300')
  })

  it('renders as a link when linkTo is provided', () => {
    renderStatCard({ label: 'Events', value: 10, linkTo: '/events' })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/events')
  })

  it('does not render a link when linkTo is not provided', () => {
    renderStatCard({ label: 'Events', value: 10 })

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

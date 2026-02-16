import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatusTransitionControl } from './StatusTransitionControl'
import type { EventFormData } from '../../types/event-form'
import { eventToFormData } from '../../types/event-form'
import { createEvent } from '../../test/fixtures'

function createFormData(overrides: Partial<EventFormData> = {}): EventFormData {
  return {
    ...eventToFormData(createEvent()),
    ...overrides,
  }
}

describe('StatusTransitionControl', () => {
  it('renders current status badge', () => {
    render(
      <StatusTransitionControl
        currentStatus="draft"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders transition buttons for draft status', () => {
    render(
      <StatusTransitionControl
        currentStatus="draft"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /archived/i })).toBeInTheDocument()
  })

  it('renders transition buttons for approved status', () => {
    render(
      <StatusTransitionControl
        currentStatus="approved"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /archived/i })).toBeInTheDocument()
  })

  it('shows no transitions for archived status', () => {
    render(
      <StatusTransitionControl
        currentStatus="archived"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    expect(screen.getByText('No transitions available')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onTransition when button is clicked', () => {
    const onTransition = vi.fn()
    render(
      <StatusTransitionControl
        currentStatus="draft"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={onTransition}
        isTransitioning={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /review/i }))
    expect(onTransition).toHaveBeenCalledWith('review')
  })

  it('disables buttons when transitioning', () => {
    render(
      <StatusTransitionControl
        currentStatus="draft"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={vi.fn()}
        isTransitioning={true}
      />
    )
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('disables publish button when form is incomplete', () => {
    const incompleteForm = createFormData({ event_description: '' })
    render(
      <StatusTransitionControl
        currentStatus="approved"
        eventName="Test Event"
        formData={incompleteForm}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    const publishBtn = screen.getByRole('button', { name: /published/i })
    expect(publishBtn).toBeDisabled()
  })

  it('enables publish button when form is complete', () => {
    render(
      <StatusTransitionControl
        currentStatus="approved"
        eventName="Test Event"
        formData={createFormData()}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    const publishBtn = screen.getByRole('button', { name: /published/i })
    expect(publishBtn).not.toBeDisabled()
  })

  it('shows tooltip on disabled publish button', () => {
    const incompleteForm = createFormData({ event_description: '' })
    render(
      <StatusTransitionControl
        currentStatus="approved"
        eventName="My Event"
        formData={incompleteForm}
        onTransition={vi.fn()}
        isTransitioning={false}
      />
    )
    const publishBtn = screen.getByRole('button', { name: /published/i })
    expect(publishBtn.title).toContain('Cannot publish')
    expect(publishBtn.title).toContain('My Event')
  })
})

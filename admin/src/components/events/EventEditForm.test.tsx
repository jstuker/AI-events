import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventEditForm } from './EventEditForm'
import { eventToFormData } from '../../types/event-form'
import { createEvent } from '../../test/fixtures'

describe('EventEditForm', () => {
  const defaultProps = {
    formData: eventToFormData(createEvent()),
    errors: {},
    setField: vi.fn(),
    setArray: vi.fn(),
  }

  it('renders all form sections', () => {
    render(<EventEditForm {...defaultProps} />)

    expect(screen.getByText('Metadata')).toBeInTheDocument()
    expect(screen.getByText('Event Details')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Organizer & Contact')).toBeInTheDocument()
    expect(screen.getByText('Promotion')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders event name input with value', () => {
    render(<EventEditForm {...defaultProps} />)
    const input = screen.getByLabelText(/^Name/)
    expect(input).toHaveValue('Test AI Event')
  })

  it('renders status select', () => {
    render(<EventEditForm {...defaultProps} />)
    const select = screen.getByLabelText('Status')
    expect(select).toHaveValue('published')
  })

  it('displays validation errors', () => {
    const errors = { event_name: 'Event name is required' }
    render(<EventEditForm {...defaultProps} errors={errors} />)
    expect(screen.getByText('Event name is required')).toBeInTheDocument()
  })
})

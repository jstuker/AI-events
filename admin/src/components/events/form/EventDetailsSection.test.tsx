import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventDetailsSection } from './EventDetailsSection'
import { eventToFormData } from '../../../types/event-form'
import { createEvent } from '../../../test/fixtures'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    errors: {} as Record<string, string>,
    setField: vi.fn(),
    setArray: vi.fn(),
    ...overrides,
  }
}

describe('EventDetailsSection', () => {
  it('renders legend', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByText('Event Details')).toBeInTheDocument()
  })

  it('renders event name input with value', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText(/^Name/)).toHaveValue('Test AI Event')
  })

  it('renders slug input with value', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Slug')).toHaveValue('test-ai-event')
  })

  it('renders event URL input', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Event URL')).toHaveValue('https://example.com/event')
  })

  it('renders description textarea', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Description')).toHaveValue('A test event for AI enthusiasts')
  })

  it('renders start date input', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Start Date')).toHaveValue('2026-03-15')
  })

  it('renders end date input', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('End Date')).toHaveValue('2026-03-16')
  })

  it('renders attendance mode select', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Attendance Mode')).toHaveValue('presence')
  })

  it('renders target audience input', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Target Audience')).toHaveValue('developers')
  })

  it('renders languages input as comma-separated', () => {
    render(<EventDetailsSection {...defaultProps()} />)
    expect(screen.getByLabelText('Languages')).toHaveValue('en')
  })

  describe('user interactions', () => {
    it('calls setField when name changes', async () => {
      const setField = vi.fn()
      render(<EventDetailsSection {...defaultProps({ setField })} />)

      const input = screen.getByLabelText(/^Name/)
      await userEvent.clear(input)
      await userEvent.type(input, 'New Name')

      expect(setField).toHaveBeenCalledWith('event_name', expect.any(String))
    })

    it('calls setField when slug changes', async () => {
      const setField = vi.fn()
      render(<EventDetailsSection {...defaultProps({ setField })} />)

      await userEvent.clear(screen.getByLabelText('Slug'))
      await userEvent.type(screen.getByLabelText('Slug'), 'new-slug')

      expect(setField).toHaveBeenCalledWith('slug', expect.any(String))
    })

    it('calls setField when attendance mode changes', async () => {
      const setField = vi.fn()
      render(<EventDetailsSection {...defaultProps({ setField })} />)

      await userEvent.selectOptions(screen.getByLabelText('Attendance Mode'), 'online')

      expect(setField).toHaveBeenCalledWith('event_attendance_mode', 'online')
    })

    it('calls setArray when languages change', async () => {
      const setArray = vi.fn()
      render(<EventDetailsSection {...defaultProps({ setArray })} />)

      const input = screen.getByLabelText('Languages')
      await userEvent.clear(input)
      await userEvent.type(input, 'en, de')

      expect(setArray).toHaveBeenCalled()
    })
  })

  describe('validation errors', () => {
    it('displays event name error', () => {
      render(<EventDetailsSection {...defaultProps({ errors: { event_name: 'Name is required' } })} />)
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    it('displays slug error', () => {
      render(<EventDetailsSection {...defaultProps({ errors: { slug: 'Invalid slug' } })} />)
      expect(screen.getByText('Invalid slug')).toBeInTheDocument()
    })

    it('displays event URL error', () => {
      render(<EventDetailsSection {...defaultProps({ errors: { event_url: 'Invalid URL' } })} />)
      expect(screen.getByText('Invalid URL')).toBeInTheDocument()
    })

    it('displays start date error', () => {
      render(<EventDetailsSection {...defaultProps({ errors: { event_start_date: 'Date required' } })} />)
      expect(screen.getByText('Date required')).toBeInTheDocument()
    })

    it('displays end date error', () => {
      render(<EventDetailsSection {...defaultProps({ errors: { event_end_date: 'Invalid date' } })} />)
      expect(screen.getByText('Invalid date')).toBeInTheDocument()
    })

    it('applies error border class to name input', () => {
      render(<EventDetailsSection {...defaultProps({ errors: { event_name: 'required' } })} />)
      expect(screen.getByLabelText(/^Name/)).toHaveClass('border-red-300')
    })

    it('does not show error when none exists', () => {
      render(<EventDetailsSection {...defaultProps()} />)
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
    })
  })
})

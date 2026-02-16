import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrganizerContactSection } from './OrganizerContactSection'
import { eventToFormData } from '../../../types/event-form'
import { createEvent } from '../../../test/fixtures'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    errors: {} as Record<string, string>,
    setField: vi.fn(),
    ...overrides,
  }
}

describe('OrganizerContactSection', () => {
  it('renders legend', () => {
    render(<OrganizerContactSection {...defaultProps()} />)
    expect(screen.getByText('Organizer & Contact')).toBeInTheDocument()
  })

  it('renders organizer name input', () => {
    render(<OrganizerContactSection {...defaultProps()} />)
    expect(screen.getByLabelText('Organizer Name')).toHaveValue('Test Org')
  })

  it('renders organizer URL input', () => {
    render(<OrganizerContactSection {...defaultProps()} />)
    expect(screen.getByLabelText('Organizer URL')).toHaveValue('https://example.com')
  })

  it('renders contact name input', () => {
    render(<OrganizerContactSection {...defaultProps()} />)
    expect(screen.getByLabelText('Contact Name')).toHaveValue('Test Contact')
  })

  it('renders contact email input', () => {
    render(<OrganizerContactSection {...defaultProps()} />)
    expect(screen.getByLabelText('Contact Email')).toHaveValue('test@example.com')
  })

  it('renders contact phone input', () => {
    render(<OrganizerContactSection {...defaultProps()} />)
    expect(screen.getByLabelText('Contact Phone')).toHaveValue('+41 79 000 00 00')
  })

  describe('user interactions', () => {
    it('calls setField when organizer name changes', async () => {
      const setField = vi.fn()
      render(<OrganizerContactSection {...defaultProps({ setField })} />)

      await userEvent.clear(screen.getByLabelText('Organizer Name'))
      await userEvent.type(screen.getByLabelText('Organizer Name'), 'New Org')
      expect(setField).toHaveBeenCalledWith('organizer_name', expect.any(String))
    })

    it('calls setField when contact email changes', async () => {
      const setField = vi.fn()
      render(<OrganizerContactSection {...defaultProps({ setField })} />)

      await userEvent.clear(screen.getByLabelText('Contact Email'))
      await userEvent.type(screen.getByLabelText('Contact Email'), 'new@test.com')
      expect(setField).toHaveBeenCalledWith('contact_email', expect.any(String))
    })
  })

  describe('validation errors', () => {
    it('displays organizer URL error', () => {
      render(<OrganizerContactSection {...defaultProps({ errors: { organizer_url: 'Invalid URL' } })} />)
      expect(screen.getByText('Invalid URL')).toBeInTheDocument()
    })

    it('displays contact email error', () => {
      render(<OrganizerContactSection {...defaultProps({ errors: { contact_email: 'Invalid email' } })} />)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('applies error border to organizer URL', () => {
      render(<OrganizerContactSection {...defaultProps({ errors: { organizer_url: 'err' } })} />)
      expect(screen.getByLabelText('Organizer URL')).toHaveClass('border-red-300')
    })

    it('applies error border to contact email', () => {
      render(<OrganizerContactSection {...defaultProps({ errors: { contact_email: 'err' } })} />)
      expect(screen.getByLabelText('Contact Email')).toHaveClass('border-red-300')
    })
  })
})

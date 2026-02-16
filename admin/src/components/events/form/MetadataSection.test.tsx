import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MetadataSection } from './MetadataSection'
import { eventToFormData } from '../../../types/event-form'
import { createEvent } from '../../../test/fixtures'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    setField: vi.fn(),
    ...overrides,
  }
}

describe('MetadataSection', () => {
  it('renders legend', () => {
    render(<MetadataSection {...defaultProps()} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
  })

  it('renders status select with current value', () => {
    render(<MetadataSection {...defaultProps()} />)
    expect(screen.getByLabelText('Status')).toHaveValue('published')
  })

  it('renders source input', () => {
    render(<MetadataSection {...defaultProps()} />)
    expect(screen.getByLabelText('Source')).toHaveValue('manual')
  })

  it('displays event ID as read-only text', () => {
    render(<MetadataSection {...defaultProps()} />)
    expect(screen.getByText('evt-001')).toBeInTheDocument()
  })

  it('displays dash when event ID is empty', () => {
    const formData = eventToFormData(createEvent({ event_id: '' }))
    render(<MetadataSection {...defaultProps({ formData })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('displays created and updated timestamps', () => {
    render(<MetadataSection {...defaultProps()} />)
    expect(screen.getByText('2026-01-01T00:00:00Z')).toBeInTheDocument()
    expect(screen.getByText('2026-01-15T00:00:00Z')).toBeInTheDocument()
  })

  describe('status options', () => {
    it('renders all statuses by default', () => {
      render(<MetadataSection {...defaultProps()} />)
      const select = screen.getByLabelText('Status')
      expect(select.querySelectorAll('option')).toHaveLength(6)
    })

    it('renders only allowed statuses when provided', () => {
      render(<MetadataSection {...defaultProps({ allowedStatuses: ['draft', 'review'] })} />)
      const select = screen.getByLabelText('Status')
      expect(select.querySelectorAll('option')).toHaveLength(2)
    })
  })

  describe('user interactions', () => {
    it('calls setField when status changes', async () => {
      const setField = vi.fn()
      render(<MetadataSection {...defaultProps({ setField })} />)

      await userEvent.selectOptions(screen.getByLabelText('Status'), 'draft')
      expect(setField).toHaveBeenCalledWith('status', 'draft')
    })

    it('calls setField when source changes', async () => {
      const setField = vi.fn()
      render(<MetadataSection {...defaultProps({ setField })} />)

      await userEvent.clear(screen.getByLabelText('Source'))
      await userEvent.type(screen.getByLabelText('Source'), 'api')
      expect(setField).toHaveBeenCalledWith('source', expect.any(String))
    })
  })
})

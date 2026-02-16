import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BodySection } from './BodySection'
import { eventToFormData } from '../../../types/event-form'
import { createEvent } from '../../../test/fixtures'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    setField: vi.fn(),
    ...overrides,
  }
}

describe('BodySection', () => {
  it('renders legend', () => {
    render(<BodySection {...defaultProps()} />)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders body textarea with value', () => {
    render(<BodySection {...defaultProps()} />)
    expect(screen.getByLabelText('Body (Markdown)')).toHaveValue('Event body content')
  })

  it('renders textarea with placeholder', () => {
    render(<BodySection {...defaultProps()} />)
    expect(screen.getByPlaceholderText('Event description in Markdown...')).toBeInTheDocument()
  })

  it('renders textarea with monospace font class', () => {
    render(<BodySection {...defaultProps()} />)
    expect(screen.getByLabelText('Body (Markdown)')).toHaveClass('font-mono')
  })

  it('calls setField when body changes', async () => {
    const setField = vi.fn()
    render(<BodySection {...defaultProps({ setField })} />)

    const textarea = screen.getByLabelText('Body (Markdown)')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'New content')
    expect(setField).toHaveBeenCalledWith('body', expect.any(String))
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationSection } from './LocationSection'
import { eventToFormData } from '../../../types/event-form'
import { createEvent } from '../../../test/fixtures'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    setField: vi.fn(),
    ...overrides,
  }
}

describe('LocationSection', () => {
  it('renders legend', () => {
    render(<LocationSection {...defaultProps()} />)
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('renders location name input with value', () => {
    render(<LocationSection {...defaultProps()} />)
    expect(screen.getByLabelText('Location Name')).toHaveValue('Zurich')
  })

  it('renders address input with value', () => {
    render(<LocationSection {...defaultProps()} />)
    expect(screen.getByLabelText('Address')).toHaveValue('Bahnhofstrasse 1')
  })

  it('calls setField when location name changes', async () => {
    const setField = vi.fn()
    render(<LocationSection {...defaultProps({ setField })} />)

    await userEvent.clear(screen.getByLabelText('Location Name'))
    await userEvent.type(screen.getByLabelText('Location Name'), 'Geneva')
    expect(setField).toHaveBeenCalledWith('location_name', expect.any(String))
  })

  it('calls setField when address changes', async () => {
    const setField = vi.fn()
    render(<LocationSection {...defaultProps({ setField })} />)

    await userEvent.clear(screen.getByLabelText('Address'))
    await userEvent.type(screen.getByLabelText('Address'), 'Rue du Lac 1')
    expect(setField).toHaveBeenCalledWith('location_address', expect.any(String))
  })
})

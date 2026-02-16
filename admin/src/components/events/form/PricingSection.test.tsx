import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PricingSection } from './PricingSection'
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

describe('PricingSection', () => {
  it('renders legend', () => {
    render(<PricingSection {...defaultProps()} />)
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('renders price type select', () => {
    render(<PricingSection {...defaultProps()} />)
    expect(screen.getByLabelText('Price Type')).toHaveValue('free')
  })

  it('renders currency input', () => {
    render(<PricingSection {...defaultProps()} />)
    expect(screen.getByLabelText('Currency')).toHaveValue('CHF')
  })

  it('renders availability select', () => {
    render(<PricingSection {...defaultProps()} />)
    expect(screen.getByLabelText('Availability')).toHaveValue('InStock')
  })

  describe('conditional price fields', () => {
    it('does not show price input when type is free', () => {
      render(<PricingSection {...defaultProps()} />)
      expect(screen.queryByLabelText('Price')).not.toBeInTheDocument()
    })

    it('shows price input when type is paid', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'paid', event_price: 50 }))
      render(<PricingSection {...defaultProps({ formData })} />)
      expect(screen.getByLabelText('Price')).toBeInTheDocument()
      expect(screen.getByLabelText('Price')).toHaveValue(50)
    })

    it('does not show range inputs when type is free', () => {
      render(<PricingSection {...defaultProps()} />)
      expect(screen.queryByLabelText('Low Price')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('High Price')).not.toBeInTheDocument()
    })

    it('does not show range inputs when type is paid', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'paid' }))
      render(<PricingSection {...defaultProps({ formData })} />)
      expect(screen.queryByLabelText('Low Price')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('High Price')).not.toBeInTheDocument()
    })

    it('shows range inputs when type is range', () => {
      const formData = eventToFormData(createEvent({
        event_price_type: 'range',
        event_low_price: 10,
        event_high_price: 100,
      }))
      render(<PricingSection {...defaultProps({ formData })} />)
      expect(screen.getByLabelText('Low Price')).toHaveValue(10)
      expect(screen.getByLabelText('High Price')).toHaveValue(100)
    })

    it('does not show single price input when type is range', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'range' }))
      render(<PricingSection {...defaultProps({ formData })} />)
      expect(screen.queryByLabelText('Price')).not.toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('calls setField when price type changes', async () => {
      const setField = vi.fn()
      render(<PricingSection {...defaultProps({ setField })} />)

      await userEvent.selectOptions(screen.getByLabelText('Price Type'), 'paid')
      expect(setField).toHaveBeenCalledWith('event_price_type', 'paid')
    })

    it('calls setField when currency changes', async () => {
      const setField = vi.fn()
      render(<PricingSection {...defaultProps({ setField })} />)

      await userEvent.clear(screen.getByLabelText('Currency'))
      await userEvent.type(screen.getByLabelText('Currency'), 'EUR')
      expect(setField).toHaveBeenCalledWith('event_price_currency', expect.any(String))
    })

    it('calls setField when availability changes', async () => {
      const setField = vi.fn()
      render(<PricingSection {...defaultProps({ setField })} />)

      await userEvent.selectOptions(screen.getByLabelText('Availability'), 'SoldOut')
      expect(setField).toHaveBeenCalledWith('event_price_availability', 'SoldOut')
    })

    it('calls setField with number when price changes', async () => {
      const setField = vi.fn()
      const formData = eventToFormData(createEvent({ event_price_type: 'paid', event_price: 50 }))
      render(<PricingSection {...defaultProps({ formData, setField })} />)

      await userEvent.clear(screen.getByLabelText('Price'))
      await userEvent.type(screen.getByLabelText('Price'), '75')
      expect(setField).toHaveBeenCalledWith('event_price', expect.any(Number))
    })

    it('calls setField with null when price is cleared', async () => {
      const setField = vi.fn()
      const formData = eventToFormData(createEvent({ event_price_type: 'paid', event_price: 50 }))
      render(<PricingSection {...defaultProps({ formData, setField })} />)

      await userEvent.clear(screen.getByLabelText('Price'))
      expect(setField).toHaveBeenCalledWith('event_price', null)
    })
  })

  describe('validation errors', () => {
    it('displays price error', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'paid' }))
      render(<PricingSection {...defaultProps({ formData, errors: { event_price: 'Price required' } })} />)
      expect(screen.getByText('Price required')).toBeInTheDocument()
    })

    it('displays low price error', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'range' }))
      render(<PricingSection {...defaultProps({ formData, errors: { event_low_price: 'Required' } })} />)
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('displays high price error', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'range' }))
      render(<PricingSection {...defaultProps({ formData, errors: { event_high_price: 'Required' } })} />)
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('applies error border to price input', () => {
      const formData = eventToFormData(createEvent({ event_price_type: 'paid' }))
      render(<PricingSection {...defaultProps({ formData, errors: { event_price: 'err' } })} />)
      expect(screen.getByLabelText('Price')).toHaveClass('border-red-300')
    })
  })
})

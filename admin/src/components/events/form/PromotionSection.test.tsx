import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromotionSection } from './PromotionSection'
import { eventToFormData } from '../../../types/event-form'
import { createEvent } from '../../../test/fixtures'

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: eventToFormData(createEvent()),
    setField: vi.fn(),
    setArray: vi.fn(),
    ...overrides,
  }
}

describe('PromotionSection', () => {
  it('renders legend', () => {
    render(<PromotionSection {...defaultProps()} />)
    expect(screen.getByText('Promotion')).toBeInTheDocument()
  })

  it('renders featured checkbox unchecked by default', () => {
    render(<PromotionSection {...defaultProps()} />)
    expect(screen.getByLabelText('Featured')).not.toBeChecked()
  })

  it('renders featured checkbox checked when featured', () => {
    const formData = eventToFormData(createEvent({ featured: true }))
    render(<PromotionSection {...defaultProps({ formData })} />)
    expect(screen.getByLabelText('Featured')).toBeChecked()
  })

  it('renders tags input with comma-separated values', () => {
    render(<PromotionSection {...defaultProps()} />)
    expect(screen.getByLabelText('Tags')).toHaveValue('ai, tech')
  })

  describe('conditional featured type', () => {
    it('does not show featured type when not featured', () => {
      render(<PromotionSection {...defaultProps()} />)
      expect(screen.queryByLabelText('Featured Type')).not.toBeInTheDocument()
    })

    it('shows featured type select when featured', () => {
      const formData = eventToFormData(createEvent({ featured: true, featured_type: 'badge' }))
      render(<PromotionSection {...defaultProps({ formData })} />)
      expect(screen.getByLabelText('Featured Type')).toHaveValue('badge')
    })

    it('shows all featured type options', () => {
      const formData = eventToFormData(createEvent({ featured: true }))
      render(<PromotionSection {...defaultProps({ formData })} />)
      expect(screen.getByText('None')).toBeInTheDocument()
      expect(screen.getByText('Badge')).toBeInTheDocument()
      expect(screen.getByText('Accent Border')).toBeInTheDocument()
      expect(screen.getByText('Larger Card')).toBeInTheDocument()
      expect(screen.getByText('Position Boost')).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('calls setField when featured checkbox toggled', async () => {
      const setField = vi.fn()
      render(<PromotionSection {...defaultProps({ setField })} />)

      await userEvent.click(screen.getByLabelText('Featured'))
      expect(setField).toHaveBeenCalledWith('featured', true)
    })

    it('calls setField when featured type changes', async () => {
      const setField = vi.fn()
      const formData = eventToFormData(createEvent({ featured: true }))
      render(<PromotionSection {...defaultProps({ formData, setField })} />)

      await userEvent.selectOptions(screen.getByLabelText('Featured Type'), 'badge')
      expect(setField).toHaveBeenCalledWith('featured_type', 'badge')
    })

    it('calls setArray when tags change', async () => {
      const setArray = vi.fn()
      render(<PromotionSection {...defaultProps({ setArray })} />)

      await userEvent.clear(screen.getByLabelText('Tags'))
      await userEvent.type(screen.getByLabelText('Tags'), 'ml, deep-learning')
      expect(setArray).toHaveBeenCalled()
    })
  })
})

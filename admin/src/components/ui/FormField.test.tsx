import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders label and value', () => {
    render(<FormField label="Event Name" value="AI Summit" />)
    expect(screen.getByText('Event Name')).toBeInTheDocument()
    expect(screen.getByText('AI Summit')).toBeInTheDocument()
  })

  it('renders dash for empty value', () => {
    render(<FormField label="Location" value="" />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<FormField label="Name" value="" error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('does not render error when not provided', () => {
    render(<FormField label="Name" value="Test" />)
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
  })
})

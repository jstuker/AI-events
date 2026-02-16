import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)
    expect(
      screen.getByPlaceholderText(/search events by name/i),
    ).toBeInTheDocument()
  })

  it('displays the current value', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    const input = screen.getByPlaceholderText(/search events/i)
    await userEvent.type(input, 'a')

    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('renders as a text input', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)
    const input = screen.getByPlaceholderText(/search events/i)
    expect(input).toHaveAttribute('type', 'text')
  })
})

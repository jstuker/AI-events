import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  itemsPerPage: 25,
  totalItems: 120,
  onPageChange: vi.fn(),
  onItemsPerPageChange: vi.fn(),
}

describe('Pagination', () => {
  it('renders nothing when totalItems is 0', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalItems={0} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows correct range text', () => {
    render(<Pagination {...defaultProps} />)
    expect(screen.getByText(/1–25 of 120/)).toBeInTheDocument()
  })

  it('shows correct range for middle page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)
    expect(screen.getByText(/51–75 of 120/)).toBeInTheDocument()
  })

  it('shows correct range for last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />)
    expect(screen.getByText(/101–120 of 120/)).toBeInTheDocument()
  })

  it('shows page indicator', () => {
    render(<Pagination {...defaultProps} currentPage={2} />)
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    expect(screen.getByText('Previous')).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />)
    expect(screen.getByText('Next')).toBeDisabled()
  })

  it('enables both buttons on middle page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)
    expect(screen.getByText('Previous')).not.toBeDisabled()
    expect(screen.getByText('Next')).not.toBeDisabled()
  })

  it('calls onPageChange with previous page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByText('Previous'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with next page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls onItemsPerPageChange when select changes', async () => {
    const onItemsPerPageChange = vi.fn()
    render(<Pagination {...defaultProps} onItemsPerPageChange={onItemsPerPageChange} />)

    const select = screen.getByDisplayValue('25 per page')
    await userEvent.selectOptions(select, '10')
    expect(onItemsPerPageChange).toHaveBeenCalledWith(10)
  })

  it('renders page size options', () => {
    render(<Pagination {...defaultProps} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options.map((o) => o.textContent)).toEqual([
      '10 per page',
      '25 per page',
      '50 per page',
    ])
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BulkActionToolbar } from './BulkActionToolbar'

describe('BulkActionToolbar', () => {
  it('renders nothing when no items selected', () => {
    const { container } = render(
      <BulkActionToolbar
        selectedCount={0}
        onBulkAction={vi.fn()}
        isProcessing={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows selected count', () => {
    render(
      <BulkActionToolbar
        selectedCount={3}
        onBulkAction={vi.fn()}
        isProcessing={false}
      />
    )
    expect(screen.getByText('3 selected')).toBeInTheDocument()
  })

  it('shows Approve and Archive buttons', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        onBulkAction={vi.fn()}
        isProcessing={false}
      />
    )
    expect(screen.getByText('Approve Selected')).toBeInTheDocument()
    expect(screen.getByText('Archive Selected')).toBeInTheDocument()
  })

  it('calls onBulkAction directly for approve', () => {
    const onBulkAction = vi.fn().mockResolvedValue(undefined)
    render(
      <BulkActionToolbar
        selectedCount={2}
        onBulkAction={onBulkAction}
        isProcessing={false}
      />
    )
    fireEvent.click(screen.getByText('Approve Selected'))
    expect(onBulkAction).toHaveBeenCalledWith('approved')
  })

  it('shows confirmation for archive action', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        onBulkAction={vi.fn()}
        isProcessing={false}
      />
    )
    fireEvent.click(screen.getByText('Archive Selected'))
    expect(screen.getByText(/Archive 2 events\?/)).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onBulkAction on confirm', () => {
    const onBulkAction = vi.fn().mockResolvedValue(undefined)
    render(
      <BulkActionToolbar
        selectedCount={1}
        onBulkAction={onBulkAction}
        isProcessing={false}
      />
    )
    fireEvent.click(screen.getByText('Archive Selected'))
    fireEvent.click(screen.getByText('Confirm'))
    expect(onBulkAction).toHaveBeenCalledWith('archived')
  })

  it('cancels confirmation', () => {
    render(
      <BulkActionToolbar
        selectedCount={1}
        onBulkAction={vi.fn()}
        isProcessing={false}
      />
    )
    fireEvent.click(screen.getByText('Archive Selected'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('disables buttons when processing', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        onBulkAction={vi.fn()}
        isProcessing={true}
      />
    )
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })
})

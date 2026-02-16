import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaveDialog } from './SaveDialog'

describe('SaveDialog', () => {
  const defaultProps = {
    defaultMessage: 'Update event',
    isSaving: false,
    onSave: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders with default message', () => {
    render(<SaveDialog {...defaultProps} />)
    const textarea = screen.getByLabelText('Commit Message')
    expect(textarea).toHaveValue('Update event')
  })

  it('calls onSave with message when Save clicked', async () => {
    const onSave = vi.fn()
    render(<SaveDialog {...defaultProps} onSave={onSave} />)

    await userEvent.click(screen.getByText('Save'))

    expect(onSave).toHaveBeenCalledWith('Update event')
  })

  it('calls onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn()
    render(<SaveDialog {...defaultProps} onCancel={onCancel} />)

    await userEvent.click(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalled()
  })

  it('shows Saving... when isSaving', () => {
    render(<SaveDialog {...defaultProps} isSaving={true} />)
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('disables Save when message is empty', async () => {
    render(<SaveDialog {...defaultProps} defaultMessage="" />)
    const saveButton = screen.getByText('Save')
    expect(saveButton).toBeDisabled()
  })
})

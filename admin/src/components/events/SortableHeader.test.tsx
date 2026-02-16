import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortableHeader } from './SortableHeader'

function renderInTable(ui: React.ReactElement) {
  return render(
    <table>
      <thead>
        <tr>{ui}</tr>
      </thead>
    </table>,
  )
}

describe('SortableHeader', () => {
  it('renders label text', () => {
    renderInTable(
      <SortableHeader
        label="Name"
        field="event_name"
        currentField="event_start_date"
        direction="asc"
        onSort={vi.fn()}
      />,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('shows ascending arrow when active and asc', () => {
    renderInTable(
      <SortableHeader
        label="Name"
        field="event_name"
        currentField="event_name"
        direction="asc"
        onSort={vi.fn()}
      />,
    )
    expect(screen.getByText('\u2191')).toBeInTheDocument()
  })

  it('shows descending arrow when active and desc', () => {
    renderInTable(
      <SortableHeader
        label="Name"
        field="event_name"
        currentField="event_name"
        direction="desc"
        onSort={vi.fn()}
      />,
    )
    expect(screen.getByText('\u2193')).toBeInTheDocument()
  })

  it('shows no arrow when not active', () => {
    renderInTable(
      <SortableHeader
        label="Name"
        field="event_name"
        currentField="event_start_date"
        direction="asc"
        onSort={vi.fn()}
      />,
    )
    expect(screen.queryByText('\u2191')).not.toBeInTheDocument()
    expect(screen.queryByText('\u2193')).not.toBeInTheDocument()
  })

  it('calls onSort with field when clicked', async () => {
    const onSort = vi.fn()
    renderInTable(
      <SortableHeader
        label="Name"
        field="event_name"
        currentField="event_start_date"
        direction="asc"
        onSort={onSort}
      />,
    )

    await userEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('event_name')
  })
})

import type { SortField, SortDirection } from '../../utils/event-filters'

interface SortableHeaderProps {
  readonly label: string
  readonly field: SortField
  readonly currentField: SortField
  readonly direction: SortDirection
  readonly onSort: (field: SortField) => void
}

export function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = field === currentField

  return (
    <th
      className="cursor-pointer select-none px-4 py-3 text-xs font-medium uppercase text-gray-500 hover:text-gray-700"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-gray-900">
            {direction === 'asc' ? '\u2191' : '\u2193'}
          </span>
        )}
      </span>
    </th>
  )
}

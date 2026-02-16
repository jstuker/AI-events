import type { Event } from '../../types/event'
import type { SortField, SortDirection } from '../../utils/event-filters'
import { EventRow } from './EventRow'
import { SortableHeader } from './SortableHeader'

interface EventTableProps {
  readonly events: readonly Event[]
  readonly sortField: SortField
  readonly sortDirection: SortDirection
  readonly onSort: (field: SortField) => void
  readonly isSelected?: (id: string) => boolean
  readonly onToggle?: (id: string) => void
  readonly onSelectAll?: () => void
  readonly allSelected?: boolean
}

export function EventTable({ events, sortField, sortDirection, onSort, isSelected, onToggle, onSelectAll, allSelected }: EventTableProps) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No events found matching your criteria.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {onToggle && (
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected ?? false}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  aria-label="Select all events"
                />
              </th>
            )}
            <SortableHeader label="Name" field="event_name" currentField={sortField} direction={sortDirection} onSort={onSort} />
            <SortableHeader label="Date" field="event_start_date" currentField={sortField} direction={sortDirection} onSort={onSort} />
            <SortableHeader label="Location" field="location_name" currentField={sortField} direction={sortDirection} onSort={onSort} />
            <SortableHeader label="Organizer" field="organizer_name" currentField={sortField} direction={sortDirection} onSort={onSort} />
            <SortableHeader label="Status" field="status" currentField={sortField} direction={sortDirection} onSort={onSort} />
            <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">Featured</th>
            <SortableHeader label="Source" field="source" currentField={sortField} direction={sortDirection} onSort={onSort} />
            <SortableHeader label="Updated" field="updated_at" currentField={sortField} direction={sortDirection} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <EventRow
              key={event.event_id}
              event={event}
              isSelected={isSelected?.(event.event_id)}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

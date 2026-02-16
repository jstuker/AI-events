import type { Event } from '../../types/event'
import type { SortField, SortDirection } from '../../utils/event-filters'
import { EventRow } from './EventRow'
import { SortableHeader } from './SortableHeader'

interface EventTableProps {
  readonly events: readonly Event[]
  readonly sortField: SortField
  readonly sortDirection: SortDirection
  readonly onSort: (field: SortField) => void
}

export function EventTable({ events, sortField, sortDirection, onSort }: EventTableProps) {
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
            <EventRow key={event.event_id} event={event} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

import type { Event } from '../../types/event'
import { StatusBadge } from './StatusBadge'

interface EventRowProps {
  readonly event: Event
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-CH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function EventRow({ event }: EventRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {event.event_name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDate(event.event_start_date)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {event.location_name || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {event.organizer_name || '—'}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={event.status} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {event.featured ? (
          <span className="text-amber-600" title={event.featured_type || undefined}>
            Yes
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {event.source || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {formatDate(event.updated_at)}
      </td>
    </tr>
  )
}

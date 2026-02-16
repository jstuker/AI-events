import { Link } from 'react-router-dom'
import type { DuplicateGroup } from '../../utils/duplicate-detection'
import { StatusBadge } from '../events/StatusBadge'

interface DuplicatesPanelProps {
  readonly groups: readonly DuplicateGroup[]
}

export function DuplicatesPanel({ groups }: DuplicatesPanelProps) {
  if (groups.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50">
      <h3 className="border-b border-amber-200 px-4 py-3 text-sm font-semibold text-amber-900">
        Potential Duplicates ({groups.length} {groups.length === 1 ? 'group' : 'groups'})
      </h3>
      <div className="divide-y divide-amber-100">
        {groups.map((group, index) => (
          <div key={index} className="px-4 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-amber-800">
                {Math.round(group.score * 100)}% match
              </span>
              <span className="text-xs text-amber-600">
                {group.reasons.join(', ')}
              </span>
            </div>
            <ul className="space-y-1">
              {group.events.map((event) => (
                <li key={event.event_id} className="flex items-center gap-2">
                  <Link
                    to={`/events/${event.event_id}`}
                    className="truncate text-sm text-blue-600 hover:underline"
                  >
                    {event.event_name}
                  </Link>
                  <StatusBadge status={event.status} />
                  <span className="whitespace-nowrap text-xs text-gray-500">
                    {event.event_start_date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

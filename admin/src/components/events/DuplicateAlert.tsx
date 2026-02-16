import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DuplicateMatch } from '../../utils/duplicate-detection'
import { StatusBadge } from './StatusBadge'

interface DuplicateAlertProps {
  readonly matches: readonly DuplicateMatch[]
}

export function DuplicateAlert({ matches }: DuplicateAlertProps) {
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set())

  if (matches.length === 0) return null

  const visibleMatches = matches.filter(
    (m) => !dismissed.has(m.matchedEvent.event_id)
  )

  if (visibleMatches.length === 0) return null

  const handleDismiss = (eventId: string) => {
    setDismissed((prev) => new Set([...prev, eventId]))
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-amber-900">
        Potential Duplicates ({visibleMatches.length})
      </h3>
      <ul className="space-y-2">
        {visibleMatches.map((match) => (
          <li
            key={match.matchedEvent.event_id}
            className="flex items-start justify-between rounded bg-white p-3 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/events/${match.matchedEvent.event_id}`}
                  className="truncate text-sm font-medium text-blue-600 hover:underline"
                >
                  {match.matchedEvent.event_name}
                </Link>
                <StatusBadge status={match.matchedEvent.status} />
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {Math.round(match.score * 100)}% match
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {match.matchedEvent.event_start_date} &middot;{' '}
                {match.matchedEvent.location_name}
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                {match.reasons.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(match.matchedEvent.event_id)}
              className="ml-2 shrink-0 text-xs text-gray-400 hover:text-gray-600"
              aria-label={`Dismiss ${match.matchedEvent.event_name}`}
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

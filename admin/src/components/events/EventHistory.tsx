import type { CommitEntry } from '../../types/event-form'

interface EventHistoryProps {
  readonly commits: readonly CommitEntry[]
  readonly isLoading: boolean
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-CH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function EventHistory({ commits, isLoading }: EventHistoryProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-500 py-4">Loading history...</p>
  }

  if (commits.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No commit history found.</p>
  }

  return (
    <div className="space-y-3">
      {commits.map((commit) => (
        <div key={commit.sha} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{commit.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {commit.author} · {formatDate(commit.date)}
            </p>
          </div>
          <a
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-mono shrink-0"
          >
            {commit.sha.slice(0, 7)}
          </a>
        </div>
      ))}
    </div>
  )
}

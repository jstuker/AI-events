import type { EventStatus } from '../../types/event'
import type { EventFormData } from '../../types/event-form'
import { StatusBadge } from './StatusBadge'
import { getNextStatuses } from '../../utils/status-workflow'
import { canPublish } from '../../utils/publish-validation'

const BUTTON_STYLES: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  review: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  pending: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  approved: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  published: 'bg-green-100 text-green-800 hover:bg-green-200',
  archived: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
}

interface StatusTransitionControlProps {
  readonly currentStatus: EventStatus
  readonly eventName: string
  readonly formData: EventFormData
  readonly onTransition: (newStatus: EventStatus) => void
  readonly isTransitioning: boolean
}

export function StatusTransitionControl({
  currentStatus,
  eventName,
  formData,
  onTransition,
  isTransitioning,
}: StatusTransitionControlProps) {
  const nextStatuses = getNextStatuses(currentStatus)

  if (nextStatuses.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <StatusBadge status={currentStatus} />
        <span className="text-sm text-gray-500">No transitions available</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <StatusBadge status={currentStatus} />
      <span className="text-gray-400" aria-hidden="true">&rarr;</span>
      {nextStatuses.map((status) => {
        const isPublish = status === 'published'
        const publishBlocked = isPublish && !canPublish(formData)

        return (
          <button
            key={status}
            type="button"
            disabled={isTransitioning || publishBlocked}
            onClick={() => onTransition(status)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              isTransitioning || publishBlocked
                ? 'cursor-not-allowed opacity-50'
                : BUTTON_STYLES[status]
            }`}
            title={
              publishBlocked
                ? `Cannot publish "${eventName}" — required fields are missing`
                : `Move to ${status}`
            }
          >
            {isTransitioning ? '...' : status}
          </button>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import type { EventStatus } from '../../types/event'

interface BulkActionToolbarProps {
  readonly selectedCount: number
  readonly onBulkAction: (newStatus: EventStatus) => Promise<void>
  readonly isProcessing: boolean
}

export function BulkActionToolbar({
  selectedCount,
  onBulkAction,
  isProcessing,
}: BulkActionToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<EventStatus | null>(null)

  if (selectedCount === 0) return null

  const handleAction = (status: EventStatus) => {
    if (status === 'archived') {
      setConfirmAction(status)
    } else {
      onBulkAction(status)
    }
  }

  const handleConfirm = async () => {
    if (confirmAction) {
      await onBulkAction(confirmAction)
      setConfirmAction(null)
    }
  }

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-4">
      <span className="text-sm font-medium text-blue-800">
        {selectedCount} selected
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleAction('approved')}
          className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Approve Selected'}
        </button>
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleAction('archived')}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Archive Selected'}
        </button>
      </div>

      {confirmAction && (
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-red-700">
            Archive {selectedCount} event{selectedCount > 1 ? 's' : ''}?
          </span>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setConfirmAction(null)}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

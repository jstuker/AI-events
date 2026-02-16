import { useState } from 'react'

interface SaveDialogProps {
  readonly defaultMessage: string
  readonly isSaving: boolean
  readonly onSave: (message: string) => void
  readonly onCancel: () => void
}

export function SaveDialog({ defaultMessage, isSaving, onSave, onCancel }: SaveDialogProps) {
  const [message, setMessage] = useState(defaultMessage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Event</h3>

        <div className="mb-4">
          <label htmlFor="commit-message" className="block text-sm font-medium text-gray-700 mb-1">
            Commit Message
          </label>
          <textarea
            id="commit-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={isSaving}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(message)}
            disabled={isSaving || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

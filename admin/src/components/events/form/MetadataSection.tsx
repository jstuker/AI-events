import type { EventFormData } from '../../../types/event-form'
import type { EventStatus } from '../../../types/event'

interface MetadataSectionProps {
  readonly formData: EventFormData
  readonly setField: (field: string, value: unknown) => void
}

const STATUS_OPTIONS: readonly EventStatus[] = [
  'draft', 'review', 'pending', 'approved', 'published', 'archived',
]

export function MetadataSection({ formData, setField }: MetadataSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Metadata</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setField('status', e.target.value as EventStatus)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
          <input
            id="source"
            type="text"
            value={formData.source}
            onChange={(e) => setField('source', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event ID</label>
          <p className="mt-1 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md">{formData.event_id || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Created</label>
          <p className="mt-1 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md">{formData.created_at || '—'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Updated</label>
          <p className="mt-1 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md">{formData.updated_at || '—'}</p>
        </div>
      </div>
    </fieldset>
  )
}

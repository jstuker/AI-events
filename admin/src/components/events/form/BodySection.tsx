import type { EventFormData } from '../../../types/event-form'

interface BodySectionProps {
  readonly formData: EventFormData
  readonly setField: (field: string, value: unknown) => void
}

export function BodySection({ formData, setField }: BodySectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Content</legend>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">
          Body (Markdown)
        </label>
        <textarea
          id="body"
          value={formData.body}
          onChange={(e) => setField('body', e.target.value)}
          rows={10}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
          placeholder="Event description in Markdown..."
        />
      </div>
    </fieldset>
  )
}

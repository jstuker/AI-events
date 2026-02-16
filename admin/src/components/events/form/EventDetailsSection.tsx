import type { EventFormData, ValidationErrors } from '../../../types/event-form'
import type { AttendanceMode } from '../../../types/event'

interface EventDetailsSectionProps {
  readonly formData: EventFormData
  readonly errors: ValidationErrors
  readonly setField: (field: string, value: unknown) => void
  readonly setArray: (field: string, value: string[]) => void
}

export function EventDetailsSection({ formData, errors, setField, setArray }: EventDetailsSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Event Details</legend>

      <div>
        <label htmlFor="event_name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="event_name"
          type="text"
          value={formData.event_name}
          onChange={(e) => setField('event_name', e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
            errors.event_name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.event_name && <p className="mt-1 text-xs text-red-600">{errors.event_name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => setField('slug', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.slug ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
        </div>

        <div>
          <label htmlFor="event_url" className="block text-sm font-medium text-gray-700">Event URL</label>
          <input
            id="event_url"
            type="url"
            value={formData.event_url}
            onChange={(e) => setField('event_url', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.event_url ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.event_url && <p className="mt-1 text-xs text-red-600">{errors.event_url}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="event_description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="event_description"
          value={formData.event_description}
          onChange={(e) => setField('event_description', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event_start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="event_start_date"
            type="date"
            value={formData.event_start_date}
            onChange={(e) => setField('event_start_date', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.event_start_date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.event_start_date && <p className="mt-1 text-xs text-red-600">{errors.event_start_date}</p>}
        </div>

        <div>
          <label htmlFor="event_end_date" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            id="event_end_date"
            type="date"
            value={formData.event_end_date}
            onChange={(e) => setField('event_end_date', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.event_end_date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.event_end_date && <p className="mt-1 text-xs text-red-600">{errors.event_end_date}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="event_attendance_mode" className="block text-sm font-medium text-gray-700">Attendance Mode</label>
          <select
            id="event_attendance_mode"
            value={formData.event_attendance_mode}
            onChange={(e) => setField('event_attendance_mode', e.target.value as AttendanceMode)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="presence">In Person</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="event_target_audience" className="block text-sm font-medium text-gray-700">Target Audience</label>
          <input
            id="event_target_audience"
            type="text"
            value={formData.event_target_audience}
            onChange={(e) => setField('event_target_audience', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="event_language" className="block text-sm font-medium text-gray-700">Languages</label>
          <input
            id="event_language"
            type="text"
            value={formData.event_language.join(', ')}
            onChange={(e) => setArray('event_language', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="en, de, fr"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </fieldset>
  )
}

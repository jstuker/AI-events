import type { EventFormData, ValidationErrors } from '../../../types/event-form'

interface OrganizerContactSectionProps {
  readonly formData: EventFormData
  readonly errors: ValidationErrors
  readonly setField: (field: string, value: unknown) => void
}

export function OrganizerContactSection({ formData, errors, setField }: OrganizerContactSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Organizer & Contact</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="organizer_name" className="block text-sm font-medium text-gray-700">Organizer Name</label>
          <input
            id="organizer_name"
            type="text"
            value={formData.organizer_name}
            onChange={(e) => setField('organizer_name', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="organizer_url" className="block text-sm font-medium text-gray-700">Organizer URL</label>
          <input
            id="organizer_url"
            type="url"
            value={formData.organizer_url}
            onChange={(e) => setField('organizer_url', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.organizer_url ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.organizer_url && <p className="mt-1 text-xs text-red-600">{errors.organizer_url}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">Contact Name</label>
          <input
            id="contact_name"
            type="text"
            value={formData.contact_name}
            onChange={(e) => setField('contact_name', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setField('contact_email', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.contact_email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.contact_email && <p className="mt-1 text-xs text-red-600">{errors.contact_email}</p>}
        </div>

        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            id="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setField('contact_phone', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </fieldset>
  )
}

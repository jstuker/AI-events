import type { EventFormData } from '../../../types/event-form'

interface LocationSectionProps {
  readonly formData: EventFormData
  readonly setField: (field: string, value: unknown) => void
}

export function LocationSection({ formData, setField }: LocationSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Location</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="location_name" className="block text-sm font-medium text-gray-700">Location Name</label>
          <input
            id="location_name"
            type="text"
            value={formData.location_name}
            onChange={(e) => setField('location_name', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="location_address" className="block text-sm font-medium text-gray-700">Address</label>
          <input
            id="location_address"
            type="text"
            value={formData.location_address}
            onChange={(e) => setField('location_address', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </fieldset>
  )
}

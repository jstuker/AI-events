import type { EventFormData, ValidationErrors } from '../../../types/event-form'
import type { PriceType, PriceAvailability } from '../../../types/event'

interface PricingSectionProps {
  readonly formData: EventFormData
  readonly errors: ValidationErrors
  readonly setField: (field: string, value: unknown) => void
}

export function PricingSection({ formData, errors, setField }: PricingSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Pricing</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="event_price_type" className="block text-sm font-medium text-gray-700">Price Type</label>
          <select
            id="event_price_type"
            value={formData.event_price_type}
            onChange={(e) => setField('event_price_type', e.target.value as PriceType)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="range">Range</option>
          </select>
        </div>

        <div>
          <label htmlFor="event_price_currency" className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            id="event_price_currency"
            type="text"
            value={formData.event_price_currency}
            onChange={(e) => setField('event_price_currency', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="event_price_availability" className="block text-sm font-medium text-gray-700">Availability</label>
          <select
            id="event_price_availability"
            value={formData.event_price_availability}
            onChange={(e) => setField('event_price_availability', e.target.value as PriceAvailability)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="InStock">Available</option>
            <option value="SoldOut">Sold Out</option>
            <option value="PreOrder">Pre-Order</option>
          </select>
        </div>
      </div>

      {formData.event_price_type === 'paid' && (
        <div className="max-w-xs">
          <label htmlFor="event_price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            id="event_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.event_price ?? ''}
            onChange={(e) => setField('event_price', e.target.value ? Number(e.target.value) : null)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.event_price ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.event_price && <p className="mt-1 text-xs text-red-600">{errors.event_price}</p>}
        </div>
      )}

      {formData.event_price_type === 'range' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
          <div>
            <label htmlFor="event_low_price" className="block text-sm font-medium text-gray-700">Low Price</label>
            <input
              id="event_low_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.event_low_price ?? ''}
              onChange={(e) => setField('event_low_price', e.target.value ? Number(e.target.value) : null)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                errors.event_low_price ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.event_low_price && <p className="mt-1 text-xs text-red-600">{errors.event_low_price}</p>}
          </div>
          <div>
            <label htmlFor="event_high_price" className="block text-sm font-medium text-gray-700">High Price</label>
            <input
              id="event_high_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.event_high_price ?? ''}
              onChange={(e) => setField('event_high_price', e.target.value ? Number(e.target.value) : null)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                errors.event_high_price ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.event_high_price && <p className="mt-1 text-xs text-red-600">{errors.event_high_price}</p>}
          </div>
        </div>
      )}
    </fieldset>
  )
}

import type { EventFormData } from '../../../types/event-form'
import type { FeaturedType } from '../../../types/event'

interface PromotionSectionProps {
  readonly formData: EventFormData
  readonly setField: (field: string, value: unknown) => void
  readonly setArray: (field: string, value: string[]) => void
}

export function PromotionSection({ formData, setField, setArray }: PromotionSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Promotion</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <input
            id="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setField('featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured</label>
        </div>

        {formData.featured && (
          <div>
            <label htmlFor="featured_type" className="block text-sm font-medium text-gray-700">Featured Type</label>
            <select
              id="featured_type"
              value={formData.featured_type}
              onChange={(e) => setField('featured_type', e.target.value as FeaturedType | '')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">None</option>
              <option value="badge">Badge</option>
              <option value="accent_border">Accent Border</option>
              <option value="larger_card">Larger Card</option>
              <option value="position_boost">Position Boost</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
        <input
          id="tags"
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => setArray('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder="ai, workshop, hackathon"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </fieldset>
  )
}

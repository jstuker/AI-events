import type { EventFormData, ValidationErrors } from '../../types/event-form'
import { MetadataSection } from './form/MetadataSection'
import { EventDetailsSection } from './form/EventDetailsSection'
import { PricingSection } from './form/PricingSection'
import { LocationSection } from './form/LocationSection'
import { OrganizerContactSection } from './form/OrganizerContactSection'
import { PromotionSection } from './form/PromotionSection'
import { BodySection } from './form/BodySection'

interface EventEditFormProps {
  readonly formData: EventFormData
  readonly errors: ValidationErrors
  readonly setField: (field: string, value: unknown) => void
  readonly setArray: (field: string, value: string[]) => void
}

export function EventEditForm({ formData, errors, setField, setArray }: EventEditFormProps) {
  return (
    <div className="space-y-8">
      <MetadataSection formData={formData} setField={setField} />
      <EventDetailsSection formData={formData} errors={errors} setField={setField} setArray={setArray} />
      <PricingSection formData={formData} errors={errors} setField={setField} />
      <LocationSection formData={formData} setField={setField} />
      <OrganizerContactSection formData={formData} errors={errors} setField={setField} />
      <PromotionSection formData={formData} setField={setField} setArray={setArray} />
      <BodySection formData={formData} setField={setField} />
    </div>
  )
}

import type { EventStatus } from '../../types/event'
import type { EventFormData, ValidationErrors } from '../../types/event-form'
import { MetadataSection } from './form/MetadataSection'
import { EventDetailsSection } from './form/EventDetailsSection'
import { PricingSection } from './form/PricingSection'
import { LocationSection } from './form/LocationSection'
import { OrganizerContactSection } from './form/OrganizerContactSection'
import { PromotionSection } from './form/PromotionSection'
import { ImageSection } from './form/ImageSection'
import { BodySection } from './form/BodySection'

interface EventEditFormProps {
  readonly formData: EventFormData
  readonly errors: ValidationErrors
  readonly setField: (field: string, value: unknown) => void
  readonly setArray: (field: string, value: string[]) => void
  readonly allowedStatuses?: readonly EventStatus[]
  readonly eventId?: string
  readonly token?: string
}

export function EventEditForm({ formData, errors, setField, setArray, allowedStatuses, eventId, token }: EventEditFormProps) {
  return (
    <div className="space-y-8">
      <MetadataSection formData={formData} setField={setField} allowedStatuses={allowedStatuses} />
      <EventDetailsSection formData={formData} errors={errors} setField={setField} setArray={setArray} />
      <PricingSection formData={formData} errors={errors} setField={setField} />
      <LocationSection formData={formData} setField={setField} />
      <OrganizerContactSection formData={formData} errors={errors} setField={setField} />
      <PromotionSection formData={formData} setField={setField} setArray={setArray} />
      {eventId && token && (
        <ImageSection formData={formData} errors={errors} setField={setField} eventId={eventId} token={token} />
      )}
      <BodySection formData={formData} setField={setField} />
    </div>
  )
}

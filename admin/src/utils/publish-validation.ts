import type { EventFormData, ValidationErrors } from '../types/event-form'
import { validateEvent, hasErrors } from './event-validation'

const PUBLISH_REQUIRED_FIELDS: readonly {
  readonly field: keyof EventFormData
  readonly label: string
}[] = [
  { field: 'event_name', label: 'Event name' },
  { field: 'event_description', label: 'Event description' },
  { field: 'event_url', label: 'Event URL' },
  { field: 'event_start_date', label: 'Start date' },
  { field: 'event_end_date', label: 'End date' },
  { field: 'slug', label: 'Slug' },
  { field: 'location_name', label: 'Location name' },
  { field: 'contact_name', label: 'Contact name' },
  { field: 'contact_email', label: 'Contact email' },
]

export function validateForPublish(form: EventFormData): ValidationErrors {
  const errors = validateEvent(form)

  for (const { field, label } of PUBLISH_REQUIRED_FIELDS) {
    const value = form[field]
    if (!errors[field] && (value === '' || value === null || value === undefined)) {
      errors[field] = `${label} is required for publishing`
    }
  }

  return errors
}

export function canPublish(form: EventFormData): boolean {
  return !hasErrors(validateForPublish(form))
}

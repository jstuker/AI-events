import { stringify as stringifyYaml } from 'yaml'
import type { Event } from '../types/event'

const FRONTMATTER_FIELD_ORDER: readonly (keyof Event)[] = [
  'event_id',
  'date',
  'slug',
  'status',
  'source',
  'created_at',
  'updated_at',
  'event_name',
  'event_description',
  'event_url',
  'event_start_date',
  'event_end_date',
  'event_attendance_mode',
  'event_target_audience',
  'event_language',
  'event_price_type',
  'event_price',
  'event_price_currency',
  'event_low_price',
  'event_high_price',
  'event_price_availability',
  'event_image_1x1',
  'event_image_16x9',
  'location_name',
  'location_address',
  'organizer_name',
  'organizer_url',
  'contact_name',
  'contact_email',
  'contact_phone',
  'featured',
  'featured_type',
  'tags',
  'publication_channels',
  'locations',
  'cities',
  'organizers',
]

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

export function serializeEventFile(event: Event): string {
  const frontmatter: Record<string, unknown> = {}

  for (const key of FRONTMATTER_FIELD_ORDER) {
    const value = event[key]
    if (!isEmptyValue(value)) {
      frontmatter[key] = value
    }
  }

  const yaml = stringifyYaml(frontmatter, { lineWidth: 0 })
  const body = event.body.trim()

  if (body) {
    return `---\n${yaml}---\n${body}\n`
  }
  return `---\n${yaml}---\n`
}

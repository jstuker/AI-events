import type { Event, EventStatus, PriceType, AttendanceMode, PriceAvailability, FeaturedType } from '../types/event'
import { parseFrontmatter } from './frontmatter'

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  return false
}

function asStringArray(value: unknown): readonly string[] {
  if (Array.isArray(value)) return value.map(asString)
  return []
}

export function parseEventFile(content: string, filePath: string): Event {
  const { data, body } = parseFrontmatter(content)

  return {
    event_id: asString(data['event_id']),
    date: asString(data['date']),
    slug: asString(data['slug']),
    status: (asString(data['status']) || 'draft') as EventStatus,
    source: asString(data['source']),
    created_at: asString(data['created_at']),
    updated_at: asString(data['updated_at']),

    contact_name: asString(data['contact_name']),
    contact_email: asString(data['contact_email']),
    contact_phone: asString(data['contact_phone']),

    event_name: asString(data['event_name']),
    event_description: asString(data['event_description']),
    event_url: asString(data['event_url']),
    event_start_date: asString(data['event_start_date']),
    event_end_date: asString(data['event_end_date']),
    event_price_type: (asString(data['event_price_type']) || 'free') as PriceType,
    event_price: asNumber(data['event_price']),
    event_price_currency: asString(data['event_price_currency']) || 'CHF',
    event_low_price: asNumber(data['event_low_price']),
    event_high_price: asNumber(data['event_high_price']),
    event_price_availability: (asString(data['event_price_availability']) || 'InStock') as PriceAvailability,
    event_image_1x1: asString(data['event_image_1x1']),
    event_image_16x9: asString(data['event_image_16x9']),
    event_language: asStringArray(data['event_language']),
    event_attendance_mode: (asString(data['event_attendance_mode']) || 'presence') as AttendanceMode,
    event_target_audience: asString(data['event_target_audience']),

    location_name: asString(data['location_name']),
    location_address: asString(data['location_address']),

    organizer_name: asString(data['organizer_name']),
    organizer_url: asString(data['organizer_url']),

    featured: asBoolean(data['featured']),
    featured_type: asString(data['featured_type']) as FeaturedType | '',
    tags: asStringArray(data['tags']),
    publication_channels: asStringArray(data['publication_channels']),

    locations: asStringArray(data['locations']),
    cities: asStringArray(data['cities']),
    organizers: asStringArray(data['organizers']),

    body,
    filePath,
  }
}

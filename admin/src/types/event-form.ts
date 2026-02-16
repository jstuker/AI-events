import type {
  Event,
  EventStatus,
  PriceType,
  AttendanceMode,
  PriceAvailability,
  FeaturedType,
} from './event'

export interface EventFormData {
  event_id: string
  date: string
  slug: string
  status: EventStatus
  source: string
  created_at: string
  updated_at: string

  contact_name: string
  contact_email: string
  contact_phone: string

  event_name: string
  event_description: string
  event_url: string
  event_start_date: string
  event_end_date: string
  event_price_type: PriceType
  event_price: number | null
  event_price_currency: string
  event_low_price: number | null
  event_high_price: number | null
  event_price_availability: PriceAvailability
  event_image_1x1: string
  event_image_16x9: string
  event_language: string[]
  event_attendance_mode: AttendanceMode
  event_target_audience: string

  location_name: string
  location_address: string

  organizer_name: string
  organizer_url: string

  featured: boolean
  featured_type: FeaturedType | ''
  tags: string[]
  publication_channels: string[]

  locations: string[]
  cities: string[]
  organizers: string[]

  body: string
}

export type ValidationErrors = Record<string, string>

export interface CommitEntry {
  readonly sha: string
  readonly message: string
  readonly author: string
  readonly date: string
  readonly url: string
}

export function eventToFormData(event: Event): EventFormData {
  return {
    event_id: event.event_id,
    date: event.date,
    slug: event.slug,
    status: event.status,
    source: event.source,
    created_at: event.created_at,
    updated_at: event.updated_at,

    contact_name: event.contact_name,
    contact_email: event.contact_email,
    contact_phone: event.contact_phone,

    event_name: event.event_name,
    event_description: event.event_description,
    event_url: event.event_url,
    event_start_date: event.event_start_date,
    event_end_date: event.event_end_date,
    event_price_type: event.event_price_type,
    event_price: event.event_price,
    event_price_currency: event.event_price_currency,
    event_low_price: event.event_low_price,
    event_high_price: event.event_high_price,
    event_price_availability: event.event_price_availability,
    event_image_1x1: event.event_image_1x1,
    event_image_16x9: event.event_image_16x9,
    event_language: [...event.event_language],
    event_attendance_mode: event.event_attendance_mode,
    event_target_audience: event.event_target_audience,

    location_name: event.location_name,
    location_address: event.location_address,

    organizer_name: event.organizer_name,
    organizer_url: event.organizer_url,

    featured: event.featured,
    featured_type: event.featured_type,
    tags: [...event.tags],
    publication_channels: [...event.publication_channels],

    locations: [...event.locations],
    cities: [...event.cities],
    organizers: [...event.organizers],

    body: event.body,
  }
}

export function formDataToEvent(form: EventFormData, filePath: string): Event {
  return {
    event_id: form.event_id,
    date: form.date,
    slug: form.slug,
    status: form.status,
    source: form.source,
    created_at: form.created_at,
    updated_at: form.updated_at,

    contact_name: form.contact_name,
    contact_email: form.contact_email,
    contact_phone: form.contact_phone,

    event_name: form.event_name,
    event_description: form.event_description,
    event_url: form.event_url,
    event_start_date: form.event_start_date,
    event_end_date: form.event_end_date,
    event_price_type: form.event_price_type,
    event_price: form.event_price,
    event_price_currency: form.event_price_currency,
    event_low_price: form.event_low_price,
    event_high_price: form.event_high_price,
    event_price_availability: form.event_price_availability,
    event_image_1x1: form.event_image_1x1,
    event_image_16x9: form.event_image_16x9,
    event_language: form.event_language,
    event_attendance_mode: form.event_attendance_mode,
    event_target_audience: form.event_target_audience,

    location_name: form.location_name,
    location_address: form.location_address,

    organizer_name: form.organizer_name,
    organizer_url: form.organizer_url,

    featured: form.featured,
    featured_type: form.featured_type,
    tags: form.tags,
    publication_channels: form.publication_channels,

    locations: form.locations,
    cities: form.cities,
    organizers: form.organizers,

    body: form.body,
    filePath,
  }
}

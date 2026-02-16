export type EventStatus =
  | 'draft'
  | 'review'
  | 'pending'
  | 'approved'
  | 'published'
  | 'archived'

export type PriceType = 'free' | 'paid' | 'range'

export type AttendanceMode = 'presence' | 'online' | 'hybrid'

export type PriceAvailability = 'InStock' | 'SoldOut' | 'PreOrder'

export type FeaturedType = 'badge' | 'accent_border' | 'larger_card' | 'position_boost'

export interface Event {
  readonly event_id: string
  readonly date: string
  readonly slug: string
  readonly status: EventStatus
  readonly source: string
  readonly created_at: string
  readonly updated_at: string

  readonly contact_name: string
  readonly contact_email: string
  readonly contact_phone: string

  readonly event_name: string
  readonly event_description: string
  readonly event_url: string
  readonly event_start_date: string
  readonly event_end_date: string
  readonly event_price_type: PriceType
  readonly event_price: number | null
  readonly event_price_currency: string
  readonly event_low_price: number | null
  readonly event_high_price: number | null
  readonly event_price_availability: PriceAvailability
  readonly event_image_1x1: string
  readonly event_image_16x9: string
  readonly event_language: readonly string[]
  readonly event_attendance_mode: AttendanceMode
  readonly event_target_audience: string

  readonly location_name: string
  readonly location_address: string

  readonly organizer_name: string
  readonly organizer_url: string

  readonly featured: boolean
  readonly featured_type: FeaturedType | ''
  readonly tags: readonly string[]
  readonly publication_channels: readonly string[]

  readonly locations: readonly string[]
  readonly cities: readonly string[]
  readonly organizers: readonly string[]

  // Markdown body content
  readonly body: string

  // File path in the repo
  readonly filePath: string
}

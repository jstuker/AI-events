import type { Event, EventStatus } from '../types/event'

export type SortField =
  | 'event_name'
  | 'event_start_date'
  | 'location_name'
  | 'organizer_name'
  | 'status'
  | 'source'
  | 'updated_at'

export type SortDirection = 'asc' | 'desc'

export function searchEvents(events: readonly Event[], query: string): readonly Event[] {
  if (!query.trim()) return events
  const lower = query.toLowerCase()
  return events.filter(
    (e) =>
      e.event_name.toLowerCase().includes(lower) ||
      e.organizer_name.toLowerCase().includes(lower) ||
      e.location_name.toLowerCase().includes(lower),
  )
}

export function filterByStatus(events: readonly Event[], status: EventStatus | ''): readonly Event[] {
  if (!status) return events
  return events.filter((e) => e.status === status)
}

export function filterByLocation(events: readonly Event[], location: string): readonly Event[] {
  if (!location) return events
  return events.filter((e) => e.location_name === location)
}

export function filterByFeatured(events: readonly Event[], featured: string): readonly Event[] {
  if (featured === '') return events
  return events.filter((e) => e.featured === (featured === 'yes'))
}

export function filterBySource(events: readonly Event[], source: string): readonly Event[] {
  if (!source) return events
  return events.filter((e) => e.source === source)
}

export function filterByDateRange(
  events: readonly Event[],
  from: string,
  to: string,
): readonly Event[] {
  return events.filter((e) => {
    const date = e.event_start_date
    if (!date) return true
    if (from && date < from) return false
    if (to && date > to) return false
    return true
  })
}

export function sortEvents(
  events: readonly Event[],
  field: SortField,
  direction: SortDirection,
): readonly Event[] {
  const sorted = [...events].sort((a, b) => {
    const aVal = a[field] ?? ''
    const bVal = b[field] ?? ''
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  })
  return direction === 'desc' ? sorted.reverse() : sorted
}

export interface FilterState {
  readonly search: string
  readonly status: EventStatus | ''
  readonly location: string
  readonly featured: string
  readonly source: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly sortField: SortField
  readonly sortDirection: SortDirection
}

export function applyAllFilters(events: readonly Event[], filters: FilterState): readonly Event[] {
  let result = searchEvents(events, filters.search)
  result = filterByStatus(result, filters.status)
  result = filterByLocation(result, filters.location)
  result = filterByFeatured(result, filters.featured)
  result = filterBySource(result, filters.source)
  result = filterByDateRange(result, filters.dateFrom, filters.dateTo)
  result = sortEvents(result, filters.sortField, filters.sortDirection)
  return result
}

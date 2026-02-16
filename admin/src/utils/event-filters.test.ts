import { describe, it, expect } from 'vitest'
import {
  searchEvents,
  filterByStatus,
  filterByLocation,
  filterByFeatured,
  filterBySource,
  filterByDateRange,
  sortEvents,
  applyAllFilters,
} from './event-filters'
import { createEvents, createEvent } from '../test/fixtures'

describe('searchEvents', () => {
  const events = createEvents()

  it('returns all events for empty query', () => {
    expect(searchEvents(events, '')).toBe(events)
    expect(searchEvents(events, '   ')).toBe(events)
  })

  it('searches by event name (case-insensitive)', () => {
    const result = searchEvents(events, 'hackathon')
    expect(result).toHaveLength(1)
    expect(result[0]!.event_name).toBe('Zurich AI Hackathon')
  })

  it('searches by organizer name', () => {
    const result = searchEvents(events, 'mlgeneva')
    expect(result).toHaveLength(1)
    expect(result[0]!.event_name).toBe('Geneva ML Workshop')
  })

  it('searches by location name', () => {
    const result = searchEvents(events, 'bern')
    expect(result).toHaveLength(1)
    expect(result[0]!.event_name).toBe('Bern Data Summit')
  })

  it('returns empty array for no matches', () => {
    expect(searchEvents(events, 'nonexistent')).toHaveLength(0)
  })
})

describe('filterByStatus', () => {
  const events = createEvents()

  it('returns all events for empty status', () => {
    expect(filterByStatus(events, '')).toBe(events)
  })

  it('filters by specific status', () => {
    const result = filterByStatus(events, 'published')
    expect(result).toHaveLength(1)
    expect(result[0]!.status).toBe('published')
  })

  it('returns empty for status with no matches', () => {
    expect(filterByStatus(events, 'archived')).toHaveLength(0)
  })
})

describe('filterByLocation', () => {
  const events = createEvents()

  it('returns all events for empty location', () => {
    expect(filterByLocation(events, '')).toBe(events)
  })

  it('filters by exact location', () => {
    const result = filterByLocation(events, 'Geneva')
    expect(result).toHaveLength(1)
    expect(result[0]!.location_name).toBe('Geneva')
  })
})

describe('filterByFeatured', () => {
  const events = createEvents()

  it('returns all events for empty filter', () => {
    expect(filterByFeatured(events, '')).toBe(events)
  })

  it('filters featured events', () => {
    const result = filterByFeatured(events, 'yes')
    expect(result).toHaveLength(1)
    expect(result[0]!.featured).toBe(true)
  })

  it('filters non-featured events', () => {
    const result = filterByFeatured(events, 'no')
    expect(result).toHaveLength(2)
    result.forEach((e) => expect(e.featured).toBe(false))
  })
})

describe('filterBySource', () => {
  const events = createEvents()

  it('returns all events for empty source', () => {
    expect(filterBySource(events, '')).toBe(events)
  })

  it('filters by source', () => {
    const result = filterBySource(events, 'api')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('api')
  })
})

describe('filterByDateRange', () => {
  const events = createEvents()

  it('returns all events when no dates set', () => {
    expect(filterByDateRange(events, '', '')).toEqual(events)
  })

  it('filters by from date', () => {
    const result = filterByDateRange(events, '2026-04-01', '')
    expect(result).toHaveLength(2)
  })

  it('filters by to date', () => {
    const result = filterByDateRange(events, '', '2026-04-15')
    expect(result).toHaveLength(2)
  })

  it('filters by date range', () => {
    const result = filterByDateRange(events, '2026-04-01', '2026-04-30')
    expect(result).toHaveLength(1)
    expect(result[0]!.event_name).toBe('Geneva ML Workshop')
  })

  it('includes events with no start date', () => {
    const eventsWithEmpty = [
      ...events,
      createEvent({ event_id: 'evt-nodate', event_start_date: '' }),
    ]
    const result = filterByDateRange(eventsWithEmpty, '2026-06-01', '')
    expect(result.some((e) => e.event_id === 'evt-nodate')).toBe(true)
  })
})

describe('sortEvents', () => {
  const events = createEvents()

  it('sorts by event name ascending', () => {
    const result = sortEvents(events, 'event_name', 'asc')
    expect(result[0]!.event_name).toBe('Bern Data Summit')
    expect(result[2]!.event_name).toBe('Zurich AI Hackathon')
  })

  it('sorts by event name descending', () => {
    const result = sortEvents(events, 'event_name', 'desc')
    expect(result[0]!.event_name).toBe('Zurich AI Hackathon')
    expect(result[2]!.event_name).toBe('Bern Data Summit')
  })

  it('sorts by start date', () => {
    const result = sortEvents(events, 'event_start_date', 'asc')
    expect(result[0]!.event_start_date).toBe('2026-03-15')
    expect(result[2]!.event_start_date).toBe('2026-05-20')
  })

  it('does not mutate the original array', () => {
    const original = [...events]
    sortEvents(events, 'event_name', 'desc')
    expect(events).toEqual(original)
  })
})

describe('applyAllFilters', () => {
  const events = createEvents()

  it('applies all filters together', () => {
    const result = applyAllFilters(events, {
      search: '',
      status: 'published',
      location: '',
      featured: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      sortField: 'event_name',
      sortDirection: 'asc',
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.event_name).toBe('Zurich AI Hackathon')
  })

  it('combines search with status filter', () => {
    const result = applyAllFilters(events, {
      search: 'zurich',
      status: 'published',
      location: '',
      featured: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      sortField: 'event_start_date',
      sortDirection: 'asc',
    })
    expect(result).toHaveLength(1)
  })

  it('returns empty when filters exclude all', () => {
    const result = applyAllFilters(events, {
      search: 'nonexistent',
      status: '',
      location: '',
      featured: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      sortField: 'event_start_date',
      sortDirection: 'asc',
    })
    expect(result).toHaveLength(0)
  })

  it('returns all events sorted when no filters active', () => {
    const result = applyAllFilters(events, {
      search: '',
      status: '',
      location: '',
      featured: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      sortField: 'event_start_date',
      sortDirection: 'asc',
    })
    expect(result).toHaveLength(3)
    expect(result[0]!.event_start_date).toBe('2026-03-15')
  })
})

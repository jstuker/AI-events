import { useMemo, useState, useCallback } from 'react'
import type { Event, EventStatus } from '../types/event'
import { applyAllFilters, type SortField, type SortDirection } from '../utils/event-filters'

export function useEventFilters(events: readonly Event[]) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('')
  const [locationFilter, setLocationFilter] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('event_start_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const filteredEvents = useMemo(
    () =>
      applyAllFilters(events, {
        search,
        status: statusFilter,
        location: locationFilter,
        featured: featuredFilter,
        source: sourceFilter,
        dateFrom,
        dateTo,
        sortField,
        sortDirection,
      }),
    [events, search, statusFilter, locationFilter, featuredFilter, sourceFilter, dateFrom, dateTo, sortField, sortDirection],
  )

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField],
  )

  return {
    filteredEvents,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    featuredFilter,
    setFeaturedFilter,
    sourceFilter,
    setSourceFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortField,
    sortDirection,
    handleSort,
  }
}

import { useCallback, useEffect, useState } from 'react'
import type { Event } from '../types/event'
import { useAuth } from '../hooks/useAuth'
import { fetchAllEvents } from '../services/event-service'
import { useEventFilters } from '../hooks/useEventFilters'
import { usePagination } from '../hooks/usePagination'
import { EventTable } from '../components/events/EventTable'
import { SearchBar } from '../components/events/SearchBar'
import { FilterPanel } from '../components/events/FilterPanel'
import { Pagination } from '../components/events/Pagination'

export function EventListPage() {
  const { token } = useAuth()
  const [allEvents, setAllEvents] = useState<readonly Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const events = await fetchAllEvents(token)
      setAllEvents(events)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const {
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
  } = useEventFilters(allEvents)

  const {
    paginatedItems,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredEvents)

  // Extract unique values for filter dropdowns
  const locations = [...new Set(allEvents.map((e) => e.location_name).filter(Boolean))].sort()
  const sources = [...new Set(allEvents.map((e) => e.source).filter(Boolean))].sort()

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading events from GitHub...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadEvents}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Events
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredEvents.length} of {allEvents.length})
          </span>
        </h2>
        <button
          onClick={loadEvents}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <FilterPanel
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        locations={locations}
        featuredFilter={featuredFilter}
        onFeaturedChange={setFeaturedFilter}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        sources={sources}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />

      <div className="rounded-lg border border-gray-200 bg-white">
        <EventTable
          events={paginatedItems}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredEvents.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}

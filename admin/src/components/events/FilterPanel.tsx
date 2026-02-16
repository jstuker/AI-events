import type { EventStatus } from '../../types/event'

const STATUSES: readonly EventStatus[] = [
  'draft',
  'review',
  'pending',
  'approved',
  'published',
  'archived',
]

interface FilterPanelProps {
  readonly statusFilter: EventStatus | ''
  readonly onStatusChange: (value: EventStatus | '') => void
  readonly locationFilter: string
  readonly onLocationChange: (value: string) => void
  readonly locations: readonly string[]
  readonly featuredFilter: string
  readonly onFeaturedChange: (value: string) => void
  readonly sourceFilter: string
  readonly onSourceChange: (value: string) => void
  readonly sources: readonly string[]
  readonly dateFrom: string
  readonly onDateFromChange: (value: string) => void
  readonly dateTo: string
  readonly onDateToChange: (value: string) => void
}

const selectStyles =
  'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
const dateStyles =
  'rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'

export function FilterPanel({
  statusFilter,
  onStatusChange,
  locationFilter,
  onLocationChange,
  locations,
  featuredFilter,
  onFeaturedChange,
  sourceFilter,
  onSourceChange,
  sources,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: FilterPanelProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as EventStatus | '')}
        className={selectStyles}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={locationFilter}
        onChange={(e) => onLocationChange(e.target.value)}
        className={selectStyles}
      >
        <option value="">All locations</option>
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <select
        value={featuredFilter}
        onChange={(e) => onFeaturedChange(e.target.value)}
        className={selectStyles}
      >
        <option value="">All events</option>
        <option value="yes">Featured</option>
        <option value="no">Not featured</option>
      </select>

      <select
        value={sourceFilter}
        onChange={(e) => onSourceChange(e.target.value)}
        className={selectStyles}
      >
        <option value="">All sources</option>
        {sources.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={dateStyles}
        />
      </div>

      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={dateStyles}
        />
      </div>
    </div>
  )
}

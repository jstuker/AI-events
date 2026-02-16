import type { Event } from '../../types/event'
import { StatusBadge } from './StatusBadge'
import { FormField } from '../ui/FormField'

interface EventDetailViewProps {
  readonly event: Event
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-CH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-CH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatPrice(event: Event): string {
  if (event.event_price_type === 'free') return 'Free'
  if (event.event_price_type === 'paid' && event.event_price !== null) {
    return `${event.event_price_currency} ${event.event_price}`
  }
  if (event.event_price_type === 'range') {
    const low = event.event_low_price ?? '?'
    const high = event.event_high_price ?? '?'
    return `${event.event_price_currency} ${low} – ${high}`
  }
  return '—'
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <section className="border-b border-gray-200 pb-6 last:border-0">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </dl>
    </section>
  )
}

export function EventDetailView({ event }: EventDetailViewProps) {
  return (
    <div className="space-y-6">
      <Section title="Metadata">
        <FormField label="Event ID" value={event.event_id} />
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
          <dd className="mt-1"><StatusBadge status={event.status} /></dd>
        </div>
        <FormField label="Source" value={event.source} />
        <FormField label="Created" value={formatDateTime(event.created_at)} />
        <FormField label="Updated" value={formatDateTime(event.updated_at)} />
        <FormField label="File" value={event.filePath} />
      </Section>

      <Section title="Event Details">
        <FormField label="Name" value={event.event_name} className="sm:col-span-2 lg:col-span-3" />
        <FormField label="Slug" value={event.slug} />
        <FormField label="URL" value={event.event_url} />
        <FormField label="Start Date" value={formatDate(event.event_start_date)} />
        <FormField label="End Date" value={formatDate(event.event_end_date)} />
        <FormField label="Attendance" value={event.event_attendance_mode} />
        <FormField label="Target Audience" value={event.event_target_audience} />
        <FormField label="Languages" value={event.event_language.join(', ')} />
        <FormField label="Description" value={event.event_description} className="sm:col-span-2 lg:col-span-3" />
      </Section>

      <Section title="Pricing">
        <FormField label="Price Type" value={event.event_price_type} />
        <FormField label="Price" value={formatPrice(event)} />
        <FormField label="Availability" value={event.event_price_availability} />
      </Section>

      <Section title="Location">
        <FormField label="Location" value={event.location_name} />
        <FormField label="Address" value={event.location_address} className="sm:col-span-2" />
      </Section>

      <Section title="Organizer & Contact">
        <FormField label="Organizer" value={event.organizer_name} />
        <FormField label="Organizer URL" value={event.organizer_url} />
        <FormField label="Contact Name" value={event.contact_name} />
        <FormField label="Contact Email" value={event.contact_email} />
        <FormField label="Contact Phone" value={event.contact_phone} />
      </Section>

      <Section title="Promotion">
        <FormField label="Featured" value={event.featured ? 'Yes' : 'No'} />
        <FormField label="Featured Type" value={event.featured_type} />
        <FormField label="Tags" value={event.tags.join(', ')} />
      </Section>

      {event.body && (
        <section className="border-b border-gray-200 pb-6 last:border-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Content</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{event.body}</pre>
          </div>
        </section>
      )}
    </div>
  )
}

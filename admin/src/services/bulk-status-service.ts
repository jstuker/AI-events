import type { Event, EventStatus } from '../types/event'
import { eventToFormData, formDataToEvent } from '../types/event-form'
import { canTransition } from '../utils/status-workflow'
import { saveEvent, fetchEventByPath } from './event-detail-service'

interface BulkUpdateResult {
  readonly succeeded: readonly Event[]
  readonly failed: readonly { readonly event: Event; readonly error: string }[]
}

export async function bulkUpdateStatus(
  token: string,
  events: readonly Event[],
  newStatus: EventStatus,
): Promise<BulkUpdateResult> {
  const succeeded: Event[] = []
  const failed: { event: Event; error: string }[] = []

  for (const event of events) {
    if (!canTransition(event.status, newStatus)) {
      failed.push({
        event,
        error: `Cannot transition from ${event.status} to ${newStatus}`,
      })
      continue
    }

    try {
      const { sha } = await fetchEventByPath(token, event.filePath)
      const formData = {
        ...eventToFormData(event),
        status: newStatus,
        date: event.event_start_date,
        updated_at: new Date().toISOString(),
      }
      const updatedEvent = formDataToEvent(formData, event.filePath)
      const message = `status: ${event.status} → ${newStatus} — ${event.event_name}`
      const result = await saveEvent(token, updatedEvent, event.filePath, sha, message)
      succeeded.push(result.event)
    } catch (err) {
      failed.push({
        event,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return { succeeded, failed }
}

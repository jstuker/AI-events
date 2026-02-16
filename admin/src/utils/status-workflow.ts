import type { EventStatus } from '../types/event'

const STATUS_TRANSITIONS: ReadonlyMap<EventStatus, readonly EventStatus[]> = new Map([
  ['draft', ['review', 'archived']],
  ['review', ['draft', 'pending', 'archived']],
  ['pending', ['review', 'approved', 'archived']],
  ['approved', ['published', 'review', 'archived']],
  ['published', ['archived']],
  ['archived', []],
])

export function canTransition(from: EventStatus, to: EventStatus): boolean {
  const allowed = STATUS_TRANSITIONS.get(from)
  return allowed !== undefined && allowed.includes(to)
}

export function getNextStatuses(current: EventStatus): readonly EventStatus[] {
  return STATUS_TRANSITIONS.get(current) ?? []
}

export function isTerminalStatus(status: EventStatus): boolean {
  const next = STATUS_TRANSITIONS.get(status)
  return next !== undefined && next.length === 0
}

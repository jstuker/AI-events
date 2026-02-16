import { describe, it, expect } from 'vitest'
import { computeDashboardStats } from './dashboard-stats'
import { createEvent } from '../test/fixtures'

const NOW = new Date('2026-02-16T12:00:00Z')

describe('computeDashboardStats', () => {
  it('returns zero counts for empty events', () => {
    const stats = computeDashboardStats([], NOW)

    expect(stats.total).toBe(0)
    expect(stats.pendingReview).toBe(0)
    expect(stats.published).toBe(0)
    expect(stats.submissionsThisWeek).toBe(0)
    expect(stats.submissionsThisMonth).toBe(0)
    expect(stats.upcoming).toEqual([])
    expect(stats.reviewQueue).toEqual([])
    expect(stats.byStatus).toEqual({
      draft: 0,
      review: 0,
      pending: 0,
      approved: 0,
      published: 0,
      archived: 0,
    })
  })

  it('counts total events', () => {
    const events = [
      createEvent({ event_id: '1' }),
      createEvent({ event_id: '2' }),
      createEvent({ event_id: '3' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.total).toBe(3)
  })

  it('counts events by status', () => {
    const events = [
      createEvent({ event_id: '1', status: 'draft' }),
      createEvent({ event_id: '2', status: 'draft' }),
      createEvent({ event_id: '3', status: 'review' }),
      createEvent({ event_id: '4', status: 'published' }),
      createEvent({ event_id: '5', status: 'archived' }),
    ]
    const stats = computeDashboardStats(events, NOW)

    expect(stats.byStatus.draft).toBe(2)
    expect(stats.byStatus.review).toBe(1)
    expect(stats.byStatus.pending).toBe(0)
    expect(stats.byStatus.approved).toBe(0)
    expect(stats.byStatus.published).toBe(1)
    expect(stats.byStatus.archived).toBe(1)
  })

  it('counts pending review as review + pending', () => {
    const events = [
      createEvent({ event_id: '1', status: 'review' }),
      createEvent({ event_id: '2', status: 'review' }),
      createEvent({ event_id: '3', status: 'pending' }),
      createEvent({ event_id: '4', status: 'published' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.pendingReview).toBe(3)
  })

  it('counts published events', () => {
    const events = [
      createEvent({ event_id: '1', status: 'published' }),
      createEvent({ event_id: '2', status: 'published' }),
      createEvent({ event_id: '3', status: 'draft' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.published).toBe(2)
  })

  it('counts submissions this week', () => {
    const events = [
      createEvent({ event_id: '1', created_at: '2026-02-15T10:00:00Z' }),
      createEvent({ event_id: '2', created_at: '2026-02-10T10:00:00Z' }),
      createEvent({ event_id: '3', created_at: '2026-02-01T10:00:00Z' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.submissionsThisWeek).toBe(2)
  })

  it('counts submissions this month', () => {
    const events = [
      createEvent({ event_id: '1', created_at: '2026-02-15T10:00:00Z' }),
      createEvent({ event_id: '2', created_at: '2026-02-01T10:00:00Z' }),
      createEvent({ event_id: '3', created_at: '2026-01-10T10:00:00Z' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.submissionsThisMonth).toBe(2)
  })

  it('returns upcoming events sorted by start date, limited to 10', () => {
    const events = Array.from({ length: 15 }, (_, i) =>
      createEvent({
        event_id: `evt-${i}`,
        event_start_date: `2026-03-${String(15 - i).padStart(2, '0')}`,
      })
    )
    const stats = computeDashboardStats(events, NOW)

    expect(stats.upcoming).toHaveLength(10)
    expect(stats.upcoming[0]!.event_start_date).toBe('2026-03-01')
    expect(stats.upcoming[9]!.event_start_date).toBe('2026-03-10')
  })

  it('excludes past events from upcoming', () => {
    const events = [
      createEvent({ event_id: '1', event_start_date: '2026-01-01' }),
      createEvent({ event_id: '2', event_start_date: '2026-03-15' }),
      createEvent({ event_id: '3', event_start_date: '2026-04-01' }),
    ]
    const stats = computeDashboardStats(events, NOW)

    expect(stats.upcoming).toHaveLength(2)
    expect(stats.upcoming[0]!.event_id).toBe('2')
  })

  it('includes events starting today in upcoming', () => {
    const events = [
      createEvent({ event_id: '1', event_start_date: '2026-02-16' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.upcoming).toHaveLength(1)
  })

  it('returns review queue sorted by updated_at descending', () => {
    const events = [
      createEvent({
        event_id: '1',
        status: 'review',
        updated_at: '2026-02-10T00:00:00Z',
      }),
      createEvent({
        event_id: '2',
        status: 'pending',
        updated_at: '2026-02-15T00:00:00Z',
      }),
      createEvent({
        event_id: '3',
        status: 'review',
        updated_at: '2026-02-12T00:00:00Z',
      }),
      createEvent({ event_id: '4', status: 'published' }),
    ]
    const stats = computeDashboardStats(events, NOW)

    expect(stats.reviewQueue).toHaveLength(3)
    expect(stats.reviewQueue[0]!.event_id).toBe('2')
    expect(stats.reviewQueue[1]!.event_id).toBe('3')
    expect(stats.reviewQueue[2]!.event_id).toBe('1')
  })

  it('returns empty review queue when no review/pending events', () => {
    const events = [
      createEvent({ event_id: '1', status: 'published' }),
      createEvent({ event_id: '2', status: 'draft' }),
    ]
    const stats = computeDashboardStats(events, NOW)
    expect(stats.reviewQueue).toEqual([])
  })
})

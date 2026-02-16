import { describe, it, expect } from 'vitest'
import {
  normalize,
  diceCoefficient,
  computePairScore,
  findDuplicatesForEvent,
  findAllDuplicateGroups,
} from './duplicate-detection'
import { createEvent } from '../test/fixtures'

describe('normalize', () => {
  it('lowercases text', () => {
    expect(normalize('Hello World')).toBe('hello world')
  })

  it('removes diacritics', () => {
    expect(normalize('Zürich Café')).toBe('zurich cafe')
  })

  it('removes punctuation', () => {
    expect(normalize('AI-Powered: Event!')).toBe('ai powered event')
  })

  it('collapses whitespace', () => {
    expect(normalize('  hello   world  ')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(normalize('')).toBe('')
  })
})

describe('diceCoefficient', () => {
  it('returns 1 for identical strings', () => {
    expect(diceCoefficient('hello', 'hello')).toBe(1)
  })

  it('returns 1 for case-insensitive match', () => {
    expect(diceCoefficient('Hello', 'hello')).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    expect(diceCoefficient('abc', 'xyz')).toBe(0)
  })

  it('returns high score for similar strings', () => {
    const score = diceCoefficient('Zurich AI Hackathon', 'Zürich AI Hackathon')
    expect(score).toBeGreaterThan(0.9)
  })

  it('returns moderate score for partially similar strings', () => {
    const score = diceCoefficient('AI Hackathon Zurich', 'AI Hackathon Geneva')
    expect(score).toBeGreaterThan(0.5)
    expect(score).toBeLessThan(0.9)
  })

  it('returns 0 for single character strings', () => {
    expect(diceCoefficient('a', 'a')).toBe(1) // exact match short-circuit
    expect(diceCoefficient('a', 'b')).toBe(0) // too short for bigrams
  })

  it('handles strings with typos', () => {
    const score = diceCoefficient('Hackathon', 'Hackatohn')
    expect(score).toBeGreaterThan(0.5)
  })
})

describe('computePairScore', () => {
  it('returns 0 for the same event', () => {
    const event = createEvent({ event_id: '1' })
    const result = computePairScore(event, event)
    expect(result.score).toBe(0)
    expect(result.reasons).toEqual([])
  })

  it('detects near-identical names', () => {
    const a = createEvent({ event_id: '1', event_name: 'Zurich AI Hackathon 2026' })
    const b = createEvent({ event_id: '2', event_name: 'Zürich AI Hackathon 2026' })
    const result = computePairScore(a, b)
    expect(result.score).toBeGreaterThan(0)
    expect(result.reasons.some((r) => r.includes('name'))).toBe(true)
  })

  it('detects same start date', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Event Alpha',
      event_start_date: '2026-06-15',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Event Beta',
      event_start_date: '2026-06-15',
    })
    const result = computePairScore(a, b)
    expect(result.reasons).toContain('Same start date')
  })

  it('detects overlapping dates', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Event Alpha',
      event_start_date: '2026-06-14',
      event_end_date: '2026-06-16',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Event Beta',
      event_start_date: '2026-06-15',
      event_end_date: '2026-06-17',
    })
    const result = computePairScore(a, b)
    expect(result.reasons).toContain('Overlapping dates')
  })

  it('detects same location', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Event Alpha',
      location_name: 'Zurich',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Event Beta',
      location_name: 'Zurich',
    })
    const result = computePairScore(a, b)
    expect(result.reasons).toContain('Same location')
  })

  it('detects same organizer', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Event Alpha',
      organizer_name: 'SwissAI',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Event Beta',
      organizer_name: 'SwissAI',
    })
    const result = computePairScore(a, b)
    expect(result.reasons).toContain('Same organizer')
  })

  it('detects same URL', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Event Alpha',
      event_url: 'https://example.com/hackathon',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Event Beta',
      event_url: 'https://example.com/hackathon',
    })
    const result = computePairScore(a, b)
    expect(result.reasons).toContain('Same URL')
  })

  it('gives high score for name + date + location match', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Zurich AI Hackathon',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Zürich AI Hackathon',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
    })
    const result = computePairScore(a, b)
    expect(result.score).toBeGreaterThanOrEqual(0.8)
  })

  it('returns low score for completely different events', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'ML Workshop Geneva',
      event_start_date: '2026-03-15',
      location_name: 'Geneva',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Blockchain Summit Bern',
      event_start_date: '2026-09-20',
      location_name: 'Bern',
    })
    const result = computePairScore(a, b)
    expect(result.score).toBeLessThan(0.5)
  })

  it('caps score at 1', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Exact Same Name',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
      organizer_name: 'Org',
      event_url: 'https://same.url',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Exact Same Name',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
      organizer_name: 'Org',
      event_url: 'https://same.url',
    })
    const result = computePairScore(a, b)
    expect(result.score).toBeLessThanOrEqual(1)
  })
})

describe('findDuplicatesForEvent', () => {
  it('returns empty array when no duplicates', () => {
    const target = createEvent({
      event_id: '1',
      event_name: 'Unique Event',
      event_start_date: '2026-01-01',
      location_name: 'Zurich',
      organizer_name: 'Org A',
      event_url: 'https://a.com',
    })
    const others = [
      createEvent({
        event_id: '2',
        event_name: 'Completely Different',
        event_start_date: '2026-06-15',
        location_name: 'Geneva',
        organizer_name: 'Org B',
        event_url: 'https://b.com',
      }),
      createEvent({
        event_id: '3',
        event_name: 'Something Else Entirely',
        event_start_date: '2026-09-20',
        location_name: 'Bern',
        organizer_name: 'Org C',
        event_url: 'https://c.com',
      }),
    ]
    const result = findDuplicatesForEvent(target, [target, ...others])
    expect(result).toEqual([])
  })

  it('finds duplicates sorted by score descending', () => {
    const target = createEvent({
      event_id: '1',
      event_name: 'Zurich AI Hackathon',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
    })
    const strongMatch = createEvent({
      event_id: '2',
      event_name: 'Zürich AI Hackathon',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
    })
    const weakerMatch = createEvent({
      event_id: '3',
      event_name: 'AI Hackathon Zurich',
      event_start_date: '2026-07-01',
      location_name: 'Zurich',
    })
    const noMatch = createEvent({
      event_id: '4',
      event_name: 'Blockchain Summit',
      event_start_date: '2026-09-01',
      location_name: 'Bern',
    })

    const result = findDuplicatesForEvent(target, [target, strongMatch, weakerMatch, noMatch])
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]!.matchedEvent.event_id).toBe('2')

    // Scores should be in descending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.score).toBeLessThanOrEqual(result[i - 1]!.score)
    }
  })

  it('excludes the event itself', () => {
    const event = createEvent({ event_id: '1' })
    const result = findDuplicatesForEvent(event, [event])
    expect(result).toEqual([])
  })

  it('respects custom threshold', () => {
    const a = createEvent({
      event_id: '1',
      event_name: 'Zurich AI Hackathon',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
    })
    const b = createEvent({
      event_id: '2',
      event_name: 'Zürich AI Hackathon',
      event_start_date: '2026-06-15',
      location_name: 'Zurich',
    })

    const highThreshold = findDuplicatesForEvent(a, [a, b], 0.99)
    const lowThreshold = findDuplicatesForEvent(a, [a, b], 0.1)

    expect(highThreshold.length).toBeLessThanOrEqual(lowThreshold.length)
  })
})

describe('findAllDuplicateGroups', () => {
  it('returns empty array when no duplicates', () => {
    const events = [
      createEvent({ event_id: '1', event_name: 'Event Alpha', event_start_date: '2026-01-01', location_name: 'A' }),
      createEvent({ event_id: '2', event_name: 'Something Different', event_start_date: '2026-06-15', location_name: 'B' }),
      createEvent({ event_id: '3', event_name: 'Third Unique Event', event_start_date: '2026-12-01', location_name: 'C' }),
    ]
    const groups = findAllDuplicateGroups(events)
    expect(groups).toEqual([])
  })

  it('groups duplicate events together', () => {
    const events = [
      createEvent({
        event_id: '1',
        event_name: 'Zurich AI Hackathon',
        event_start_date: '2026-06-15',
        location_name: 'Zurich',
      }),
      createEvent({
        event_id: '2',
        event_name: 'Zürich AI Hackathon',
        event_start_date: '2026-06-15',
        location_name: 'Zurich',
      }),
      createEvent({
        event_id: '3',
        event_name: 'Totally Different Conference',
        event_start_date: '2026-09-01',
        location_name: 'Bern',
      }),
    ]
    const groups = findAllDuplicateGroups(events)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.events).toHaveLength(2)
    expect(groups[0]!.score).toBeGreaterThan(0)
    expect(groups[0]!.reasons.length).toBeGreaterThan(0)
  })

  it('sorts groups by score descending', () => {
    const events = [
      createEvent({
        event_id: '1',
        event_name: 'Exact Same Event',
        event_start_date: '2026-06-15',
        location_name: 'Zurich',
        event_url: 'https://same.url',
      }),
      createEvent({
        event_id: '2',
        event_name: 'Exact Same Event',
        event_start_date: '2026-06-15',
        location_name: 'Zurich',
        event_url: 'https://same.url',
      }),
      createEvent({
        event_id: '3',
        event_name: 'Somewhat Similar',
        event_start_date: '2026-06-15',
        location_name: 'Zurich',
      }),
      createEvent({
        event_id: '4',
        event_name: 'Somewhat Similar Event',
        event_start_date: '2026-06-15',
        location_name: 'Zurich',
      }),
    ]
    const groups = findAllDuplicateGroups(events)

    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]!.score).toBeLessThanOrEqual(groups[i - 1]!.score)
    }
  })

  it('handles empty event list', () => {
    const groups = findAllDuplicateGroups([])
    expect(groups).toEqual([])
  })

  it('handles single event', () => {
    const groups = findAllDuplicateGroups([createEvent()])
    expect(groups).toEqual([])
  })
})

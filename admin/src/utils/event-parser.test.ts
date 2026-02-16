import { describe, it, expect } from 'vitest'
import { parseEventFile } from './event-parser'
import { SAMPLE_FRONTMATTER, MINIMAL_FRONTMATTER, NO_FRONTMATTER } from '../test/fixtures'

describe('parseEventFile', () => {
  it('parses a complete event file', () => {
    const event = parseEventFile(SAMPLE_FRONTMATTER, 'content/events/2026/03/15/evt-001.md')

    expect(event.event_id).toBe('evt-001')
    expect(event.event_name).toBe('Zurich AI Hackathon')
    expect(event.status).toBe('published')
    expect(event.event_start_date).toBe('2026-03-15')
    expect(event.location_name).toBe('Zurich')
    expect(event.organizer_name).toBe('SwissAI')
    expect(event.featured).toBe(true)
    expect(event.tags).toEqual(['ai', 'hackathon'])
    expect(event.body).toBe('This is the event body.')
    expect(event.filePath).toBe('content/events/2026/03/15/evt-001.md')
  })

  it('applies default values for missing fields', () => {
    const event = parseEventFile(MINIMAL_FRONTMATTER, 'test.md')

    expect(event.event_name).toBe('Minimal Event')
    expect(event.status).toBe('draft')
    expect(event.event_price_type).toBe('free')
    expect(event.event_price_currency).toBe('CHF')
    expect(event.event_price_availability).toBe('InStock')
    expect(event.event_attendance_mode).toBe('presence')
    expect(event.event_id).toBe('')
    expect(event.location_name).toBe('')
    expect(event.featured).toBe(false)
    expect(event.tags).toEqual([])
  })

  it('handles file with no frontmatter', () => {
    const event = parseEventFile(NO_FRONTMATTER, 'test.md')

    expect(event.event_name).toBe('')
    expect(event.status).toBe('draft')
    expect(event.body).toBe(NO_FRONTMATTER)
  })

  it('coerces numeric values', () => {
    const raw = '---\nevent_price: "42"\nevent_low_price: 10\nevent_high_price: invalid\n---\n'
    const event = parseEventFile(raw, 'test.md')

    expect(event.event_price).toBe(42)
    expect(event.event_low_price).toBe(10)
    expect(event.event_high_price).toBeNull()
  })

  it('coerces boolean values', () => {
    const rawTrue = '---\nfeatured: true\n---\n'
    const rawFalse = '---\nfeatured: "yes"\n---\n'

    expect(parseEventFile(rawTrue, 'test.md').featured).toBe(true)
    expect(parseEventFile(rawFalse, 'test.md').featured).toBe(false)
  })

  it('coerces string arrays', () => {
    const raw = '---\ntags:\n  - ai\n  - ml\nevent_language: not-an-array\n---\n'
    const event = parseEventFile(raw, 'test.md')

    expect(event.tags).toEqual(['ai', 'ml'])
    expect(event.event_language).toEqual([])
  })

  it('handles null and undefined values', () => {
    const raw = '---\nevent_name: null\nevent_price: null\n---\n'
    const event = parseEventFile(raw, 'test.md')

    expect(event.event_name).toBe('')
    expect(event.event_price).toBeNull()
  })
})

import { describe, it, expect } from 'vitest'
import { serializeEventFile } from './event-serializer'
import { parseEventFile } from './event-parser'
import { createEvent } from '../test/fixtures'

describe('serializeEventFile', () => {
  it('produces valid frontmatter with body', () => {
    const event = createEvent({ body: 'Hello world' })
    const result = serializeEventFile(event)

    expect(result).toMatch(/^---\n/)
    expect(result).toMatch(/---\nHello world\n$/)
    expect(result).toContain('event_name: Test AI Event')
  })

  it('omits empty string fields', () => {
    const event = createEvent({ event_image_1x1: '', event_image_16x9: '' })
    const result = serializeEventFile(event)

    expect(result).not.toContain('event_image_1x1')
    expect(result).not.toContain('event_image_16x9')
  })

  it('omits null fields', () => {
    const event = createEvent({ event_price: null, event_low_price: null })
    const result = serializeEventFile(event)

    expect(result).not.toContain('event_price:')
    expect(result).not.toContain('event_low_price')
  })

  it('omits empty arrays', () => {
    const event = createEvent({ publication_channels: [], locations: [], cities: [] })
    const result = serializeEventFile(event)

    expect(result).not.toContain('publication_channels')
    expect(result).not.toContain('locations')
    expect(result).not.toContain('cities')
  })

  it('includes non-empty arrays', () => {
    const event = createEvent({ tags: ['ai', 'tech'] })
    const result = serializeEventFile(event)

    expect(result).toContain('tags:')
    expect(result).toContain('- ai')
    expect(result).toContain('- tech')
  })

  it('handles event with empty body', () => {
    const event = createEvent({ body: '' })
    const result = serializeEventFile(event)

    expect(result).toMatch(/---\n$/)
  })

  it('round-trips: parse -> serialize -> parse yields same data', () => {
    const original = createEvent({
      event_name: 'Round Trip Test',
      event_start_date: '2026-06-01',
      event_end_date: '2026-06-02',
      tags: ['ml', 'workshop'],
      event_price_type: 'paid',
      event_price: 50,
      featured: true,
      featured_type: 'badge',
      body: 'Some event description\n\nWith paragraphs.',
    })

    const serialized = serializeEventFile(original)
    const parsed = parseEventFile(serialized, original.filePath)

    expect(parsed.event_name).toBe(original.event_name)
    expect(parsed.event_start_date).toBe(original.event_start_date)
    expect(parsed.event_end_date).toBe(original.event_end_date)
    expect(parsed.tags).toEqual(original.tags)
    expect(parsed.event_price_type).toBe(original.event_price_type)
    expect(parsed.event_price).toBe(original.event_price)
    expect(parsed.featured).toBe(original.featured)
    expect(parsed.featured_type).toBe(original.featured_type)
    expect(parsed.body).toBe('Some event description\n\nWith paragraphs.')
    expect(parsed.filePath).toBe(original.filePath)
  })

  it('round-trips minimal event', () => {
    const original = createEvent({
      event_name: 'Minimal',
      event_price: null,
      event_low_price: null,
      event_high_price: null,
      tags: [],
      body: '',
    })

    const serialized = serializeEventFile(original)
    const parsed = parseEventFile(serialized, original.filePath)

    expect(parsed.event_name).toBe('Minimal')
    expect(parsed.event_price).toBeNull()
    expect(parsed.tags).toEqual([])
  })

  it('does not include filePath or body in frontmatter', () => {
    const event = createEvent()
    const result = serializeEventFile(event)

    expect(result).not.toContain('filePath:')
    // body should be after the closing --- not in frontmatter
    const parts = result.split('---')
    const frontmatterSection = parts[1] ?? ''
    expect(frontmatterSection).not.toContain('body:')
  })
})

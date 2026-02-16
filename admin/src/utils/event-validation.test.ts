import { describe, it, expect } from 'vitest'
import { validateEvent, hasErrors } from './event-validation'
import type { EventFormData } from '../types/event-form'
import { eventToFormData } from '../types/event-form'
import { createEvent } from '../test/fixtures'

function createFormData(overrides: Partial<EventFormData> = {}): EventFormData {
  return {
    ...eventToFormData(createEvent()),
    ...overrides,
  }
}

describe('validateEvent', () => {
  it('returns no errors for valid event', () => {
    const form = createFormData()
    const errors = validateEvent(form)
    expect(errors).toEqual({})
  })

  it('requires event_name', () => {
    const form = createFormData({ event_name: '' })
    const errors = validateEvent(form)
    expect(errors.event_name).toBe('Event name is required')
  })

  it('requires event_name to not be only whitespace', () => {
    const form = createFormData({ event_name: '   ' })
    const errors = validateEvent(form)
    expect(errors.event_name).toBe('Event name is required')
  })

  it('validates slug format', () => {
    const form = createFormData({ slug: 'Invalid Slug!' })
    const errors = validateEvent(form)
    expect(errors.slug).toContain('lowercase')
  })

  it('accepts valid slug', () => {
    const form = createFormData({ slug: 'my-valid-slug-123' })
    const errors = validateEvent(form)
    expect(errors.slug).toBeUndefined()
  })

  it('allows empty slug', () => {
    const form = createFormData({ slug: '' })
    const errors = validateEvent(form)
    expect(errors.slug).toBeUndefined()
  })

  it('validates start date format', () => {
    const form = createFormData({ event_start_date: 'not-a-date' })
    const errors = validateEvent(form)
    expect(errors.event_start_date).toContain('Invalid date')
  })

  it('validates end date format', () => {
    const form = createFormData({ event_end_date: 'bad' })
    const errors = validateEvent(form)
    expect(errors.event_end_date).toContain('Invalid date')
  })

  it('validates end date >= start date', () => {
    const form = createFormData({
      event_start_date: '2026-06-15',
      event_end_date: '2026-06-10',
    })
    const errors = validateEvent(form)
    expect(errors.event_end_date).toContain('on or after')
  })

  it('allows same start and end date', () => {
    const form = createFormData({
      event_start_date: '2026-06-15',
      event_end_date: '2026-06-15',
    })
    const errors = validateEvent(form)
    expect(errors.event_end_date).toBeUndefined()
  })

  it('requires price when type is paid', () => {
    const form = createFormData({ event_price_type: 'paid', event_price: null })
    const errors = validateEvent(form)
    expect(errors.event_price).toContain('required')
  })

  it('does not require price when type is free', () => {
    const form = createFormData({ event_price_type: 'free', event_price: null })
    const errors = validateEvent(form)
    expect(errors.event_price).toBeUndefined()
  })

  it('requires low and high price for range type', () => {
    const form = createFormData({
      event_price_type: 'range',
      event_low_price: null,
      event_high_price: null,
    })
    const errors = validateEvent(form)
    expect(errors.event_low_price).toContain('required')
    expect(errors.event_high_price).toContain('required')
  })

  it('validates high price >= low price', () => {
    const form = createFormData({
      event_price_type: 'range',
      event_low_price: 100,
      event_high_price: 50,
    })
    const errors = validateEvent(form)
    expect(errors.event_high_price).toContain('>=')
  })

  it('validates event URL format', () => {
    const form = createFormData({ event_url: 'not-a-url' })
    const errors = validateEvent(form)
    expect(errors.event_url).toContain('valid URL')
  })

  it('accepts valid event URL', () => {
    const form = createFormData({ event_url: 'https://example.com' })
    const errors = validateEvent(form)
    expect(errors.event_url).toBeUndefined()
  })

  it('allows empty event URL', () => {
    const form = createFormData({ event_url: '' })
    const errors = validateEvent(form)
    expect(errors.event_url).toBeUndefined()
  })

  it('validates organizer URL format', () => {
    const form = createFormData({ organizer_url: 'ftp://bad' })
    const errors = validateEvent(form)
    expect(errors.organizer_url).toContain('valid URL')
  })

  it('validates email format', () => {
    const form = createFormData({ contact_email: 'not-an-email' })
    const errors = validateEvent(form)
    expect(errors.contact_email).toContain('valid email')
  })

  it('accepts valid email', () => {
    const form = createFormData({ contact_email: 'user@example.com' })
    const errors = validateEvent(form)
    expect(errors.contact_email).toBeUndefined()
  })

  it('allows empty email', () => {
    const form = createFormData({ contact_email: '' })
    const errors = validateEvent(form)
    expect(errors.contact_email).toBeUndefined()
  })
})

describe('hasErrors', () => {
  it('returns false for empty errors', () => {
    expect(hasErrors({})).toBe(false)
  })

  it('returns true when errors exist', () => {
    expect(hasErrors({ event_name: 'Required' })).toBe(true)
  })
})

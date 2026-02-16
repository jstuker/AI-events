import { describe, it, expect } from 'vitest'
import { validateForPublish, canPublish } from './publish-validation'
import type { EventFormData } from '../types/event-form'
import { eventToFormData } from '../types/event-form'
import { createEvent } from '../test/fixtures'

function createFormData(overrides: Partial<EventFormData> = {}): EventFormData {
  return {
    ...eventToFormData(createEvent()),
    ...overrides,
  }
}

describe('validateForPublish', () => {
  it('returns no errors for a complete event', () => {
    const form = createFormData()
    const errors = validateForPublish(form)
    expect(errors).toEqual({})
  })

  it('requires event_name', () => {
    const form = createFormData({ event_name: '' })
    const errors = validateForPublish(form)
    expect(errors.event_name).toBeTruthy()
  })

  it('requires event_description', () => {
    const form = createFormData({ event_description: '' })
    const errors = validateForPublish(form)
    expect(errors.event_description).toContain('required for publishing')
  })

  it('requires event_url', () => {
    const form = createFormData({ event_url: '' })
    const errors = validateForPublish(form)
    expect(errors.event_url).toContain('required for publishing')
  })

  it('requires event_start_date', () => {
    const form = createFormData({ event_start_date: '' })
    const errors = validateForPublish(form)
    expect(errors.event_start_date).toContain('required for publishing')
  })

  it('requires event_end_date', () => {
    const form = createFormData({ event_end_date: '' })
    const errors = validateForPublish(form)
    expect(errors.event_end_date).toContain('required for publishing')
  })

  it('requires slug', () => {
    const form = createFormData({ slug: '' })
    const errors = validateForPublish(form)
    expect(errors.slug).toContain('required for publishing')
  })

  it('requires location_name', () => {
    const form = createFormData({ location_name: '' })
    const errors = validateForPublish(form)
    expect(errors.location_name).toContain('required for publishing')
  })

  it('requires contact_name', () => {
    const form = createFormData({ contact_name: '' })
    const errors = validateForPublish(form)
    expect(errors.contact_name).toContain('required for publishing')
  })

  it('requires contact_email', () => {
    const form = createFormData({ contact_email: '' })
    const errors = validateForPublish(form)
    expect(errors.contact_email).toContain('required for publishing')
  })

  it('reports multiple missing fields', () => {
    const form = createFormData({
      event_description: '',
      slug: '',
      contact_name: '',
    })
    const errors = validateForPublish(form)
    expect(errors.event_description).toBeTruthy()
    expect(errors.slug).toBeTruthy()
    expect(errors.contact_name).toBeTruthy()
  })

  it('includes base validation errors', () => {
    const form = createFormData({ event_url: 'not-a-url' })
    const errors = validateForPublish(form)
    expect(errors.event_url).toContain('valid URL')
  })
})

describe('canPublish', () => {
  it('returns true for a complete event', () => {
    const form = createFormData()
    expect(canPublish(form)).toBe(true)
  })

  it('returns false when required fields are missing', () => {
    const form = createFormData({ event_description: '' })
    expect(canPublish(form)).toBe(false)
  })

  it('returns false when base validation fails', () => {
    const form = createFormData({ contact_email: 'bad-email' })
    expect(canPublish(form)).toBe(false)
  })
})

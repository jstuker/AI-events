import { describe, it, expect } from 'vitest'
import { splitDateTime, combineDateTime, eventToFormData, formDataToEvent } from './event-form'
import { createEvent } from '../test/fixtures'

describe('splitDateTime', () => {
  it('splits full ISO-8601 datetime into date and time', () => {
    expect(splitDateTime('2026-09-17T09:00:00+02:00')).toEqual({
      date: '2026-09-17',
      time: '09:00',
    })
  })

  it('splits datetime with Z timezone', () => {
    expect(splitDateTime('2026-11-15T14:30:00Z')).toEqual({
      date: '2026-11-15',
      time: '14:30',
    })
  })

  it('handles date-only string', () => {
    expect(splitDateTime('2026-03-15')).toEqual({
      date: '2026-03-15',
      time: '',
    })
  })

  it('handles empty string', () => {
    expect(splitDateTime('')).toEqual({ date: '', time: '' })
  })
})

describe('combineDateTime', () => {
  it('combines date and time into ISO-8601 with Swiss timezone', () => {
    expect(combineDateTime('2026-09-17', '09:00')).toBe('2026-09-17T09:00:00+01:00')
  })

  it('returns date only when time is empty', () => {
    expect(combineDateTime('2026-09-17', '')).toBe('2026-09-17')
  })

  it('returns empty string when date is empty', () => {
    expect(combineDateTime('', '09:00')).toBe('')
  })
})

describe('eventToFormData datetime splitting', () => {
  it('splits ISO-8601 start date into date and time', () => {
    const event = createEvent({ event_start_date: '2026-11-15T14:00:00+01:00' })
    const form = eventToFormData(event)
    expect(form.event_start_date).toBe('2026-11-15')
    expect(form.event_start_time).toBe('14:00')
  })

  it('splits ISO-8601 end date into date and time', () => {
    const event = createEvent({ event_end_date: '2026-11-15T18:00:00+01:00' })
    const form = eventToFormData(event)
    expect(form.event_end_date).toBe('2026-11-15')
    expect(form.event_end_time).toBe('18:00')
  })

  it('handles date-only values', () => {
    const event = createEvent({ event_start_date: '2026-03-15', event_end_date: '2026-03-16' })
    const form = eventToFormData(event)
    expect(form.event_start_date).toBe('2026-03-15')
    expect(form.event_start_time).toBe('')
    expect(form.event_end_date).toBe('2026-03-16')
    expect(form.event_end_time).toBe('')
  })
})

describe('formDataToEvent datetime combining', () => {
  it('combines date and time into ISO-8601', () => {
    const form = eventToFormData(createEvent())
    form.event_start_date = '2026-09-17'
    form.event_start_time = '09:00'
    form.event_end_date = '2026-09-17'
    form.event_end_time = '18:00'

    const event = formDataToEvent(form, 'content/events/2026/09/17/test.md')
    expect(event.event_start_date).toBe('2026-09-17T09:00:00+01:00')
    expect(event.event_end_date).toBe('2026-09-17T18:00:00+01:00')
  })

  it('returns date only when time is empty', () => {
    const form = eventToFormData(createEvent())
    form.event_start_date = '2026-03-15'
    form.event_start_time = ''

    const event = formDataToEvent(form, 'content/events/2026/03/15/test.md')
    expect(event.event_start_date).toBe('2026-03-15')
  })
})

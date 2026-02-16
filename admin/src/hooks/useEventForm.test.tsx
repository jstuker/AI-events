import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventForm } from './useEventForm'
import { eventToFormData } from '../types/event-form'
import { createEvent } from '../test/fixtures'

function createInitialData() {
  return eventToFormData(createEvent())
}

describe('useEventForm', () => {
  it('initializes with provided data', () => {
    const data = createInitialData()
    const { result } = renderHook(() => useEventForm(data))

    expect(result.current.formData.event_name).toBe('Test AI Event')
    expect(result.current.isDirty).toBe(false)
    expect(result.current.errors).toEqual({})
  })

  it('setField updates a field and marks dirty', () => {
    const data = createInitialData()
    const { result } = renderHook(() => useEventForm(data))

    act(() => {
      result.current.setField('event_name', 'Updated Name')
    })

    expect(result.current.formData.event_name).toBe('Updated Name')
    expect(result.current.isDirty).toBe(true)
  })

  it('setArray updates an array field', () => {
    const data = createInitialData()
    const { result } = renderHook(() => useEventForm(data))

    act(() => {
      result.current.setArray('tags', ['ml', 'workshop'])
    })

    expect(result.current.formData.tags).toEqual(['ml', 'workshop'])
    expect(result.current.isDirty).toBe(true)
  })

  it('validate returns true for valid data', () => {
    const data = createInitialData()
    const { result } = renderHook(() => useEventForm(data))

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(true)
    expect(result.current.errors).toEqual({})
  })

  it('validate returns false and sets errors for invalid data', () => {
    const data = createInitialData()
    const { result } = renderHook(() => useEventForm(data))

    act(() => {
      result.current.setField('event_name', '')
    })

    let isValid = true
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(false)
    expect(result.current.errors.event_name).toBeDefined()
  })

  it('reset restores data and clears state', () => {
    const data = createInitialData()
    const { result } = renderHook(() => useEventForm(data))

    act(() => {
      result.current.setField('event_name', 'Changed')
    })

    expect(result.current.isDirty).toBe(true)

    const freshData = eventToFormData(createEvent({ event_name: 'Fresh' }))
    act(() => {
      result.current.reset(freshData)
    })

    expect(result.current.formData.event_name).toBe('Fresh')
    expect(result.current.isDirty).toBe(false)
    expect(result.current.errors).toEqual({})
  })
})

import { useReducer, useCallback, useMemo } from 'react'
import type { EventFormData, ValidationErrors } from '../types/event-form'
import { validateEvent, hasErrors } from '../utils/event-validation'

type FormAction =
  | { readonly type: 'SET_FIELD'; readonly field: string; readonly value: unknown }
  | { readonly type: 'SET_ARRAY'; readonly field: string; readonly value: string[] }
  | { readonly type: 'RESET'; readonly data: EventFormData }
  | { readonly type: 'SET_ERRORS'; readonly errors: ValidationErrors }

interface FormState {
  readonly data: EventFormData
  readonly errors: ValidationErrors
  readonly isDirty: boolean
}

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        isDirty: true,
      }
    case 'SET_ARRAY':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        isDirty: true,
      }
    case 'RESET':
      return {
        data: action.data,
        errors: {},
        isDirty: false,
      }
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      }
  }
}

export function useEventForm(initialData: EventFormData) {
  const [state, dispatch] = useReducer(reducer, {
    data: initialData,
    errors: {},
    isDirty: false,
  })

  const setField = useCallback((field: string, value: unknown) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }, [])

  const setArray = useCallback((field: string, value: string[]) => {
    dispatch({ type: 'SET_ARRAY', field, value })
  }, [])

  const reset = useCallback((data: EventFormData) => {
    dispatch({ type: 'RESET', data })
  }, [])

  const validate = useCallback((): boolean => {
    const errors = validateEvent(state.data)
    dispatch({ type: 'SET_ERRORS', errors })
    return !hasErrors(errors)
  }, [state.data])

  return useMemo(() => ({
    formData: state.data,
    errors: state.errors,
    isDirty: state.isDirty,
    setField,
    setArray,
    reset,
    validate,
  }), [state.data, state.errors, state.isDirty, setField, setArray, reset, validate])
}

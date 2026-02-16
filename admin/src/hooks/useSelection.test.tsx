import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './useSelection'

interface TestItem {
  readonly id: string
  readonly name: string
}

const items: readonly TestItem[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
  { id: '3', name: 'Gamma' },
]

describe('useSelection', () => {
  it('starts with no selections', () => {
    const { result } = renderHook(() => useSelection(items, 'id'))
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.selectedItems).toEqual([])
  })

  it('toggles selection on', () => {
    const { result } = renderHook(() => useSelection(items, 'id'))
    act(() => result.current.toggle('1'))
    expect(result.current.isSelected('1')).toBe(true)
    expect(result.current.selectedCount).toBe(1)
    expect(result.current.selectedItems).toEqual([items[0]])
  })

  it('toggles selection off', () => {
    const { result } = renderHook(() => useSelection(items, 'id'))
    act(() => result.current.toggle('1'))
    act(() => result.current.toggle('1'))
    expect(result.current.isSelected('1')).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })

  it('selects all items', () => {
    const { result } = renderHook(() => useSelection(items, 'id'))
    act(() => result.current.selectAll())
    expect(result.current.selectedCount).toBe(3)
    expect(result.current.isSelected('1')).toBe(true)
    expect(result.current.isSelected('2')).toBe(true)
    expect(result.current.isSelected('3')).toBe(true)
  })

  it('clears all selections', () => {
    const { result } = renderHook(() => useSelection(items, 'id'))
    act(() => result.current.selectAll())
    act(() => result.current.clearSelection())
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.selectedItems).toEqual([])
  })

  it('returns selected items in original order', () => {
    const { result } = renderHook(() => useSelection(items, 'id'))
    act(() => result.current.toggle('3'))
    act(() => result.current.toggle('1'))
    expect(result.current.selectedItems).toEqual([items[0], items[2]])
  })
})

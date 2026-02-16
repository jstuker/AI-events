import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from './usePagination'

describe('usePagination', () => {
  const items = Array.from({ length: 60 }, (_, i) => `item-${i}`)

  it('returns first page of items with default page size', () => {
    const { result } = renderHook(() => usePagination(items))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.itemsPerPage).toBe(25)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.paginatedItems).toHaveLength(25)
    expect(result.current.paginatedItems[0]).toBe('item-0')
  })

  it('accepts custom default page size', () => {
    const { result } = renderHook(() => usePagination(items, 10))

    expect(result.current.itemsPerPage).toBe(10)
    expect(result.current.totalPages).toBe(6)
    expect(result.current.paginatedItems).toHaveLength(10)
  })

  it('navigates to next page', () => {
    const { result } = renderHook(() => usePagination(items))

    act(() => {
      result.current.setCurrentPage(2)
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedItems[0]).toBe('item-25')
  })

  it('clamps page number to valid range (lower bound)', () => {
    const { result } = renderHook(() => usePagination(items))

    act(() => {
      result.current.setCurrentPage(0)
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('clamps page number to valid range (upper bound)', () => {
    const { result } = renderHook(() => usePagination(items))

    act(() => {
      result.current.setCurrentPage(100)
    })

    expect(result.current.totalPages).toBe(3)
    expect(result.current.currentPage).toBe(3)
  })

  it('handles last page with fewer items', () => {
    const { result } = renderHook(() => usePagination(items))

    act(() => {
      result.current.setCurrentPage(3)
    })

    // 60 items, 25 per page = page 3 has 10 items
    expect(result.current.paginatedItems).toHaveLength(10)
  })

  it('changes items per page and resets to page 1', () => {
    const { result } = renderHook(() => usePagination(items))

    act(() => {
      result.current.setCurrentPage(2)
    })
    expect(result.current.currentPage).toBe(2)

    act(() => {
      result.current.setItemsPerPage(10)
    })

    expect(result.current.currentPage).toBe(1)
    expect(result.current.itemsPerPage).toBe(10)
    expect(result.current.totalPages).toBe(6)
  })

  it('handles empty items array', () => {
    const { result } = renderHook(() => usePagination([]))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.paginatedItems).toHaveLength(0)
  })

  it('resets to page 1 when items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items),
      { initialProps: { items } },
    )

    act(() => {
      result.current.setCurrentPage(2)
    })
    expect(result.current.currentPage).toBe(2)

    rerender({ items: items.slice(0, 10) })

    expect(result.current.currentPage).toBe(1)
  })
})

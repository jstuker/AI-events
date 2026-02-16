import { useState, useCallback, useMemo } from 'react'

interface UseSelectionResult<T> {
  readonly selectedIds: ReadonlySet<string>
  readonly isSelected: (id: string) => boolean
  readonly toggle: (id: string) => void
  readonly selectAll: () => void
  readonly clearSelection: () => void
  readonly selectedCount: number
  readonly selectedItems: readonly T[]
}

export function useSelection<T>(
  items: readonly T[],
  idKey: keyof T,
): UseSelectionResult<T> {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    const allIds = new Set(items.map((item) => String(item[idKey])))
    setSelectedIds(allIds)
  }, [items, idKey])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectedCount = selectedIds.size

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(String(item[idKey]))),
    [items, selectedIds, idKey],
  )

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
    selectedCount,
    selectedItems,
  }
}

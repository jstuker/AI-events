import { useMemo, useState, useEffect, useCallback } from 'react'

export function usePagination<T>(items: readonly T[], defaultPerPage = 25) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultPerPage)

  // Reset to page 1 when items or page size change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }, [items, currentPage, itemsPerPage])

  const safeSetCurrentPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    },
    [totalPages],
  )

  return {
    paginatedItems,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage: safeSetCurrentPage,
    setItemsPerPage,
  }
}

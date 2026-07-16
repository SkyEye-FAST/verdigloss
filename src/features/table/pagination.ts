export type PageWindowEntry = number | 'ellipsis'

export function getPageWindow(totalPages: number, currentPage: number): PageWindowEntry[] {
  if (totalPages <= 0) return []
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const current = Math.min(Math.max(currentPage, 1), totalPages)
  if (current <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages]
  if (current >= totalPages - 2)
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', totalPages]
}

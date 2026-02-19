import type { Artwork, ArtworkId } from '../types/artwork'

export type SelectionState = Readonly<{
  selectedIds: ReadonlySet<ArtworkId>
  deselectedIds: ReadonlySet<ArtworkId>
}>

export function isIdSelected(
  id: ArtworkId,
  selectedIds: ReadonlySet<ArtworkId>,
  deselectedIds: ReadonlySet<ArtworkId>,
): boolean {
  return selectedIds.has(id) && !deselectedIds.has(id)
}

export function getSelectedRowsForPage(
  pageRows: readonly Artwork[],
  selectedIds: ReadonlySet<ArtworkId>,
  deselectedIds: ReadonlySet<ArtworkId>,
): Artwork[] {
  return pageRows.filter((r) => isIdSelected(r.id, selectedIds, deselectedIds))
}

type ApplyPageSelectionArgs = Readonly<{
  pageRows: readonly Artwork[]
  selectedRowIdsOnPage: ReadonlySet<ArtworkId>
  prevSelectedIds: ReadonlySet<ArtworkId>
  prevDeselectedIds: ReadonlySet<ArtworkId>
}>

export function applyPageSelection({
  pageRows,
  selectedRowIdsOnPage,
  prevSelectedIds,
  prevDeselectedIds,
}: ApplyPageSelectionArgs): { selectedIds: Set<ArtworkId>; deselectedIds: Set<ArtworkId> } {
  const nextSelected = new Set(prevSelectedIds)
  const nextDeselected = new Set(prevDeselectedIds)

  for (const row of pageRows) {
    const id = row.id
    const shouldBeSelected = selectedRowIdsOnPage.has(id)
    if (shouldBeSelected) {
      nextSelected.add(id)
      nextDeselected.delete(id)
    } else {
      nextDeselected.add(id)
    }
  }

  return { selectedIds: nextSelected, deselectedIds: nextDeselected }
}

type ApplySelectFirstNArgs = Readonly<{
  pageRows: readonly Artwork[]
  n: number
  prevSelectedIds: ReadonlySet<ArtworkId>
  prevDeselectedIds: ReadonlySet<ArtworkId>
}>

export function applySelectFirstNOnPage({
  pageRows,
  n,
  prevSelectedIds,
  prevDeselectedIds,
}: ApplySelectFirstNArgs): { selectedIds: Set<ArtworkId>; deselectedIds: Set<ArtworkId> } {
  const capped = Math.max(0, Math.min(n, pageRows.length))
  const selectedOnPage = new Set<ArtworkId>()
  for (let i = 0; i < capped; i++) selectedOnPage.add(pageRows[i].id)

  return applyPageSelection({
    pageRows,
    selectedRowIdsOnPage: selectedOnPage,
    prevSelectedIds,
    prevDeselectedIds,
  })
}


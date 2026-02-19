import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable, type DataTablePageEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { OverlayPanel } from 'primereact/overlaypanel'

import { fetchArtworksPage } from '../api/artworks'
import type { Artwork, ArtworkId } from '../types/artwork'
import { SelectionOverlay } from './SelectionOverlay'
import {
  applyPageSelection,
  applySelectFirstNOnPage,
  getSelectedRowsForPage,
} from './selectionLogic'

function countEffectiveSelected(selectedIds: ReadonlySet<ArtworkId>, deselectedIds: ReadonlySet<ArtworkId>) {
  let count = 0
  for (const id of selectedIds) if (!deselectedIds.has(id)) count++
  return count
}

export function ArtworkTable() {
  const [currentPageData, setCurrentPageData] = useState<Artwork[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(12)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<ArtworkId>>(() => new Set())
  const [deselectedIds, setDeselectedIds] = useState<Set<ArtworkId>>(() => new Set())

  const overlayRef = useRef<OverlayPanel | null>(null)

  const selectedRowsOnCurrentPage = useMemo(
    () => getSelectedRowsForPage(currentPageData, selectedIds, deselectedIds),
    [currentPageData, selectedIds, deselectedIds],
  )

  const effectiveSelectedCount = useMemo(
    () => countEffectiveSelected(selectedIds, deselectedIds),
    [selectedIds, deselectedIds],
  )

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    setLoading(true)
    setError(null)

    fetchArtworksPage({ page: currentPage, rowsPerPage, signal })
      .then((res) => {
        setCurrentPageData(res.data)
        setTotalRecords(res.pagination.total)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const msg = err instanceof Error ? err.message : 'Unknown error while fetching artworks.'
        setError(msg)
        setCurrentPageData([])
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [currentPage, rowsPerPage])

  const handlePageChange = useCallback((e: DataTablePageEvent) => {
    const nextRows = e.rows
    const nextPage = (e.page ?? 0) + 1

    setRowsPerPage((prev) => (prev === nextRows ? prev : nextRows))
    setCurrentPage((prev) => (prev === nextPage ? prev : nextPage))
  }, [])

  const handleSelectionChange = useCallback(
    (value: Artwork[] | null) => {
      const selectedRowIdsOnPage = new Set<ArtworkId>((value ?? []).map((r) => r.id))

      const { selectedIds: nextSelected, deselectedIds: nextDeselected } = applyPageSelection({
        pageRows: currentPageData,
        selectedRowIdsOnPage,
        prevSelectedIds: selectedIds,
        prevDeselectedIds: deselectedIds,
      })

      setSelectedIds(nextSelected)
      setDeselectedIds(nextDeselected)
    },
    [currentPageData, deselectedIds, selectedIds],
  )

  const handleApplySelectN = useCallback(
    (n: number) => {
      const { selectedIds: nextSelected, deselectedIds: nextDeselected } = applySelectFirstNOnPage({
        pageRows: currentPageData,
        n,
        prevSelectedIds: selectedIds,
        prevDeselectedIds: deselectedIds,
      })
      setSelectedIds(nextSelected)
      setDeselectedIds(nextDeselected)
    },
    [currentPageData, deselectedIds, selectedIds],
  )

  return (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="text-sm">
          <span className="font-medium">Selected:</span> {effectiveSelectedCount} rows
        </div>

        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            label="Custom Select"
            icon="pi pi-sliders-h"
            onClick={(ev) => overlayRef.current?.toggle(ev)}
            disabled={currentPageData.length === 0}
          />
          <SelectionOverlay
            overlayRef={overlayRef}
            maxOnPage={currentPageData.length}
            onApply={handleApplySelectN}
          />
        </div>
      </div>

      {error ? <Message severity="error" text={error} /> : null}

      <DataTable
        value={currentPageData}
        dataKey="id"
        loading={loading}
        paginator
        lazy
        first={(currentPage - 1) * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPage={handlePageChange}
        rowsPerPageOptions={[12, 24, 48]}
        selection={selectedRowsOnCurrentPage}
        onSelectionChange={(e) => handleSelectionChange((e.value as Artwork[] | null) ?? null)}
        selectionMode="multiple"
        cellSelection={false}
        stripedRows
        showGridlines
        size="small"
        removableSort
        paginatorTemplate="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        emptyMessage={loading ? 'Loading...' : 'No artworks found.'}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Place of Origin" sortable />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" sortable />
        <Column field="date_end" header="End Date" sortable />
      </DataTable>
    </div>
  )
}


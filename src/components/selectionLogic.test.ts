import { describe, expect, it } from 'vitest'
import type { Artwork } from '../types/artwork'
import {
  applyPageSelection,
  applySelectFirstNOnPage,
  getSelectedRowsForPage,
  isIdSelected,
} from './selectionLogic'

const samplePage: Artwork[] = [
  {
    id: 1,
    title: 'A',
    place_of_origin: null,
    artist_display: null,
    inscriptions: null,
    date_start: null,
    date_end: null,
  },
  {
    id: 2,
    title: 'B',
    place_of_origin: null,
    artist_display: null,
    inscriptions: null,
    date_start: null,
    date_end: null,
  },
  {
    id: 3,
    title: 'C',
    place_of_origin: null,
    artist_display: null,
    inscriptions: null,
    date_start: null,
    date_end: null,
  },
]

describe('selectionLogic', () => {
  it('computes isIdSelected from selected/deselected sets', () => {
    const selected = new Set([1, 2])
    const deselected = new Set([2])

    expect(isIdSelected(1, selected, deselected)).toBe(true)
    expect(isIdSelected(2, selected, deselected)).toBe(false)
    expect(isIdSelected(3, selected, deselected)).toBe(false)
  })

  it('applyPageSelection updates sets using only ids', () => {
    const prevSelected = new Set<number>([100])
    const prevDeselected = new Set<number>()

    const selectedRowIdsOnPage = new Set<number>([1, 3])

    const { selectedIds, deselectedIds } = applyPageSelection({
      pageRows: samplePage,
      selectedRowIdsOnPage,
      prevSelectedIds: prevSelected,
      prevDeselectedIds: prevDeselected,
    })

    expect(selectedIds.has(100)).toBe(true)
    expect(selectedIds.has(1)).toBe(true)
    expect(selectedIds.has(3)).toBe(true)
    expect(deselectedIds.has(2)).toBe(true)
  })

  it('applySelectFirstNOnPage caps at rows on page and uses only current page', () => {
    const { selectedIds, deselectedIds } = applySelectFirstNOnPage({
      pageRows: samplePage,
      n: 10,
      prevSelectedIds: new Set<number>(),
      prevDeselectedIds: new Set<number>(),
    })

    expect(selectedIds.size).toBe(3)
    expect(deselectedIds.size).toBe(0)
  })

  it('getSelectedRowsForPage derives selection from id sets', () => {
    const selected = new Set<number>([1, 42])
    const deselected = new Set<number>()

    const rows = getSelectedRowsForPage(samplePage, selected, deselected)
    expect(rows.map((r) => r.id)).toEqual([1])
  })
})


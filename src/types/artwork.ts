export type ArtworkId = number

export type Artwork = Readonly<{
  id: ArtworkId
  title: string | null
  place_of_origin: string | null
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}>

export type ArtworksPagination = Readonly<{
  total: number
  limit: number
  offset: number
  total_pages: number
  current_page: number
}>

export type ArtworksApiResponse = Readonly<{
  pagination: ArtworksPagination
  data: Artwork[]
}>

export type PaginationState = Readonly<{
  currentPage: number
  rowsPerPage: number
  totalRecords: number
}>


import type { ArtworksApiResponse } from '../types/artwork'

const API_BASE = 'https://api.artic.edu/api/v1/artworks'

export class ApiError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type FetchArtworksArgs = Readonly<{
  page: number
  rowsPerPage: number
  signal?: AbortSignal
}>

export async function fetchArtworksPage({
  page,
  rowsPerPage,
  signal,
}: FetchArtworksArgs): Promise<ArtworksApiResponse> {
  const fields = [
    'id',
    'title',
    'place_of_origin',
    'artist_display',
    'inscriptions',
    'date_start',
    'date_end',
  ].join(',')

  const url = new URL(API_BASE)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(rowsPerPage))
  url.searchParams.set('fields', fields)

  let res: Response
  try {
    res = await fetch(url.toString(), { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
    throw new ApiError('Network error while fetching artworks.', 0)
  }

  if (!res.ok) {
    throw new ApiError(`API error: ${res.status} ${res.statusText}`, res.status)
  }

  const data: unknown = await res.json()
  return data as ArtworksApiResponse
}


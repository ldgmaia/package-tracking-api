interface Root {
  page: number
  pageSize: number
  total: number
}

interface SerieData {
  tvdb_id: number
  name: string
  image: string
}

export interface Serie extends Root {
  data: SerieData[]
}

export interface TvdbSerieResponse {
  data: [
    {
      name: string
      translations: {
        eng: string
      }
      image_url: string
      tvdb_id: number
    }
  ]
  links: {
    total_items: number
  }
}

export interface ShortLink {
  id: number
  user_id: number
  original_url: string
  short_code: string
  short_url: string
  title?: string
  description?: string
  tags?: string
  click_count: number
  is_active: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface CreateLinkData {
  original_url: string
  short_code?: string
  title?: string
  description?: string
  tags?: string
  expires_at?: string
}

export interface UpdateLinkData {
  title?: string
  description?: string
  tags?: string
  is_active?: boolean
  expires_at?: string
}

export interface LinkListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
}

export interface PaginationInfo {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface LinkListResponse {
  links: ShortLink[]
  pagination: PaginationInfo
}

export interface BatchCreateData {
  urls: string[]
}

export interface BatchCreateResponse {
  created: ShortLink[]
  failed: Array<{
    url: string
    error: string
  }>
}

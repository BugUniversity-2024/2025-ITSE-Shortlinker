export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface ApiError {
  response?: {
    status: number
    data: {
      detail?: string | Array<{ loc: string[]; msg: string; type: string }>
      message?: string
    }
  }
  message?: string
}

export interface ValidationError {
  loc: string[]
  msg: string
  type: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

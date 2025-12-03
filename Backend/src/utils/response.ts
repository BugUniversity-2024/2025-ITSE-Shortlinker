import type { Response } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export function success<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
  })
}

export function created<T>(res: Response, data: T): Response {
  return success(res, data, 201)
}

export function paginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): Response {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      current_page: pagination.page,
      per_page: pagination.limit,
      total: pagination.total,
      total_pages: Math.ceil(pagination.total / pagination.limit),
    },
  })
}

export function error(
  res: Response,
  message: string,
  statusCode = 400
): Response {
  return res.status(statusCode).json({
    success: false,
    error: message,
  })
}

export function notFound(res: Response, message = 'Resource not found'): Response {
  return error(res, message, 404)
}

export function unauthorized(res: Response, message = 'Unauthorized'): Response {
  return error(res, message, 401)
}

export function forbidden(res: Response, message = 'Forbidden'): Response {
  return error(res, message, 403)
}

export function serverError(res: Response, message = 'Internal server error'): Response {
  return error(res, message, 500)
}

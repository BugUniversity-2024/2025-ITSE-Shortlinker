import type { Request, Response, NextFunction } from 'express'
import { config } from '../config/index.js'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (config.isDev) {
    console.error('Error:', err)
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      detail: err.message,
    })
    return
  }

  // Prisma error handling
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string }
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        detail: 'Data already exists',
      })
      return
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        detail: 'Record not found',
      })
      return
    }
  }

  // Other errors
  res.status(500).json({
    detail: config.isDev ? err.message : 'Internal server error',
  })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    detail: 'API endpoint not found',
  })
}

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

  // Prisma 错误处理
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string }
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        detail: '数据已存在',
      })
      return
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        detail: '记录不存在',
      })
      return
    }
  }

  // 其他错误
  res.status(500).json({
    detail: config.isDev ? err.message : '服务器内部错误',
  })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    detail: '接口不存在',
  })
}

import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt.js'
import prisma from '../config/database.js'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        username: string
        email: string
      }
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication token not provided',
      })
      return
    }

    const token = authHeader.substring(7)
    let payload: JwtPayload

    try {
      payload = verifyToken(token)
    } catch {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token',
      })
      return
    }

    // Query user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true, isActive: true },
    })

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User not found or has been disabled',
      })
      return
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next()
    return
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyToken(token)
    prisma.user
      .findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, email: true },
      })
      .then((user) => {
        if (user) {
          req.user = user
        }
        next()
      })
      .catch(() => next())
  } catch {
    next()
  }
}

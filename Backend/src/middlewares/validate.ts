import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e) => e.message).join(', ')
        res.status(400).json({
          detail: messages,
        })
        return
      }
      next(error)
    }
  }
}

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        res.status(400).json({
          detail: messages,
        })
        return
      }
      next(error)
    }
  }
}

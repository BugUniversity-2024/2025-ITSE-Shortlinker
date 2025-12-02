import type { Request, Response, NextFunction } from 'express'
import * as analyticsService from '../services/analytics.service.js'

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const period = req.query.period as string || 'week'
    const data = await analyticsService.getDashboard(req.user!.id, period)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export async function getLinkAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const linkId = parseInt(req.params.id, 10)
    const period = req.query.period as string || 'week'
    const data = await analyticsService.getLinkAnalytics(req.user!.id, linkId, period)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export async function exportAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const linkId = parseInt(req.params.id, 10)
    const format = req.query.format as string || 'json'
    const data = await analyticsService.exportAnalytics(req.user!.id, linkId, format)

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${linkId}.csv`)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${linkId}.json`)
    }

    res.send(data)
  } catch (error) {
    next(error)
  }
}

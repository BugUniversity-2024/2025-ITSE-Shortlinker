import type { Request, Response, NextFunction } from 'express'
import * as linksService from '../services/links.service.js'
import { listLinksQuery } from '../schemas/links.schema.js'
import QRCode from 'qrcode'
import { config } from '../config/index.js'

export async function createLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const link = await linksService.createLink(req.user!.id, req.body)
    res.status(201).json(link)
  } catch (error) {
    next(error)
  }
}

export async function batchCreate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await linksService.batchCreate(req.user!.id, req.body.urls)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getLinks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = listLinksQuery.parse(req.query)
    const { links, pagination } = await linksService.getLinks(req.user!.id, query)
    // 前端期望格式: { links: [...], pagination: {...} }
    res.json({
      links,
      pagination: {
        current_page: pagination.page,
        per_page: pagination.limit,
        total: pagination.total,
        total_pages: Math.ceil(pagination.total / pagination.limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getLinkById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const linkId = parseInt(req.params.id, 10)
    const link = await linksService.getLinkById(req.user!.id, linkId)
    res.json(link)
  } catch (error) {
    next(error)
  }
}

export async function getLinkInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const link = await linksService.getLinkByShortCode(req.params.shortCode)
    res.json(link)
  } catch (error) {
    next(error)
  }
}

export async function updateLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const linkId = parseInt(req.params.id, 10)
    const link = await linksService.updateLink(req.user!.id, linkId, req.body)
    res.json(link)
  } catch (error) {
    next(error)
  }
}

export async function deleteLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const linkId = parseInt(req.params.id, 10)
    await linksService.deleteLink(req.user!.id, linkId)
    res.json({ message: 'Link deleted' })
  } catch (error) {
    next(error)
  }
}

export async function toggleStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const linkId = parseInt(req.params.id, 10)
    const link = await linksService.toggleStatus(req.user!.id, linkId)
    res.json(link)
  } catch (error) {
    next(error)
  }
}

export async function getQRCode(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { shortCode } = req.params
    const size = parseInt(req.query.size as string, 10) || 200

    // 生成完整 URL
    const baseUrl = config.isDev ? `http://localhost:${config.port}` : 'https://your-domain.com'
    const url = `${baseUrl}/${shortCode}`

    // 生成 QR 码
    const qrBuffer = await QRCode.toBuffer(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(qrBuffer)
  } catch (error) {
    next(error)
  }
}

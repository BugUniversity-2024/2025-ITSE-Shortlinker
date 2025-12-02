import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import QRCode from 'qrcode'
import { config } from './config/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import routes from './routes/index.js'
import prisma from './config/database.js'
import { parseUserAgent } from './utils/userAgent.js'
import crypto from 'crypto'

const app = express()

// 安全中间件
app.use(helmet())

// CORS
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}))

// 请求日志
if (config.isDev) {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// 解析 JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// QR 码生成
app.get('/qr/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params
    const size = parseInt(req.query.size as string, 10) || 200

    const baseUrl = config.isDev ? `http://localhost:${config.port}` : 'https://your-domain.com'
    const url = `${baseUrl}/${shortCode}`

    const qrBuffer = await QRCode.toBuffer(url, {
      width: size,
      margin: 2,
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(qrBuffer)
  } catch {
    res.status(500).json({ detail: 'QR 码生成失败' })
  }
})

// 重定向信息接口
app.get('/api/redirect/:shortCode', async (req, res) => {
  try {
    const link = await prisma.shortLink.findUnique({
      where: { shortCode: req.params.shortCode },
      select: { originalUrl: true, isActive: true, expiresAt: true },
    })

    if (!link) {
      res.status(404).json({ detail: '链接不存在' })
      return
    }

    if (!link.isActive) {
      res.status(410).json({ detail: '链接已禁用' })
      return
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      res.status(410).json({ detail: '链接已过期' })
      return
    }

    res.json({ original_url: link.originalUrl })
  } catch {
    res.status(500).json({ detail: '服务器错误' })
  }
})

// 记录点击
app.post('/api/redirect/:shortCode/click', async (req, res) => {
  try {
    const link = await prisma.shortLink.findUnique({
      where: { shortCode: req.params.shortCode },
    })

    if (!link) {
      res.status(404).json({ detail: '链接不存在' })
      return
    }

    const userAgentStr = req.headers['user-agent'] || ''
    const parsed = parseUserAgent(userAgentStr)
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || ''
    const ipHash = crypto.createHash('sha256').update(ip + new Date().toDateString()).digest('hex')

    // 异步记录点击
    prisma.clickLog.create({
      data: {
        linkId: link.id,
        ipHash,
        userAgent: userAgentStr,
        referrer: req.body.referrer || req.headers.referer,
        deviceType: parsed.deviceType,
        browser: parsed.browser,
        os: parsed.os,
      },
    }).then(() => {
      prisma.shortLink.update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
      }).catch(console.error)
    }).catch(console.error)

    res.json({ message: 'ok' })
  } catch {
    res.status(500).json({ detail: '服务器错误' })
  }
})

// API 路由
app.use('/api', routes)

// 短链接重定向 (放在最后，避免匹配其他路由)
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params

    // 排除已知路径
    if (['api', 'health', 'qr', 'favicon.ico'].includes(shortCode)) {
      res.status(404).json({ detail: '路径不存在' })
      return
    }

    const link = await prisma.shortLink.findUnique({
      where: { shortCode },
    })

    if (!link) {
      res.status(404).json({ detail: '链接不存在' })
      return
    }

    if (!link.isActive) {
      res.status(410).json({ detail: '链接已禁用' })
      return
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      res.status(410).json({ detail: '链接已过期' })
      return
    }

    // 记录点击
    const userAgentStr = req.headers['user-agent'] || ''
    const parsed = parseUserAgent(userAgentStr)
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || ''
    const ipHash = crypto.createHash('sha256').update(ip + new Date().toDateString()).digest('hex')

    // 异步记录
    Promise.all([
      prisma.clickLog.create({
        data: {
          linkId: link.id,
          ipHash,
          userAgent: userAgentStr,
          referrer: req.headers.referer,
          deviceType: parsed.deviceType,
          browser: parsed.browser,
          os: parsed.os,
        },
      }),
      prisma.shortLink.update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
      }),
    ]).catch(console.error)

    // 302 重定向
    res.redirect(302, link.originalUrl)
  } catch {
    res.status(500).json({ detail: '服务器错误' })
  }
})

// 404 处理
app.use(notFoundHandler)

// 错误处理
app.use(errorHandler)

export default app

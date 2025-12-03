import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import QRCode from 'qrcode'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { config } from './config/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import routes from './routes/index.js'
import prisma from './config/database.js'
import { parseUserAgent } from './utils/userAgent.js'
import crypto from 'crypto'

// 兼容 ESM 和 CJS 的 __dirname
function getCurrentDir(): string {
  try {
    // ESM 环境
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url))
    }
  } catch {
    // ignore
  }
  // CJS 或打包环境
  return process.cwd()
}
const currentDir = getCurrentDir()

const app = express()

// 前端路由白名单（这些路径应该由前端处理，而不是短链接重定向）
const FRONTEND_ROUTES = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/generator',
  '/profile',
  '/links',
]

// 前端路由前缀（以这些开头的路径由前端处理）
const FRONTEND_PREFIXES = [
  '/dashboard/',
  '/links/',
  '/assets/',
]

// 判断是否是前端路由
function isFrontendRoute(urlPath: string): boolean {
  // 精确匹配
  if (FRONTEND_ROUTES.includes(urlPath)) {
    return true
  }
  // 前缀匹配
  for (const prefix of FRONTEND_PREFIXES) {
    if (urlPath.startsWith(prefix)) {
      return true
    }
  }
  return false
}

// 安全中间件（为静态文件服务放宽 CSP）
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

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

// 静态文件目录（打包后前端文件会放在这里）
const publicDir = path.join(currentDir, 'public')
const indexHtmlPath = path.join(publicDir, 'index.html')

// 检查是否存在前端构建产物
const hasFrontend = fs.existsSync(indexHtmlPath)

if (hasFrontend) {
  console.log('📦 Serving frontend from:', publicDir)
  // 静态文件服务
  app.use(express.static(publicDir))
}

// 短链接重定向 + SPA fallback（放在最后）
app.get('*', async (req, res, next) => {
  try {
    const urlPath = req.path

    // 排除 API 和已知路径
    if (urlPath.startsWith('/api') || urlPath === '/health' || urlPath.startsWith('/qr/')) {
      next()
      return
    }

    // 如果是前端路由，返回 index.html
    if (isFrontendRoute(urlPath)) {
      if (hasFrontend) {
        res.sendFile(indexHtmlPath)
      } else {
        res.status(404).json({ detail: '前端未构建' })
      }
      return
    }

    // 检查是否是静态资源文件（有扩展名的）
    const ext = path.extname(urlPath)
    if (ext && ext !== '.html') {
      // 静态资源不存在，404
      if (hasFrontend) {
        const filePath = path.join(publicDir, urlPath)
        if (fs.existsSync(filePath)) {
          res.sendFile(filePath)
          return
        }
      }
      res.status(404).json({ detail: '资源不存在' })
      return
    }

    // 尝试短链接重定向
    const shortCode = urlPath.slice(1) // 去掉开头的 /

    // 验证 shortCode 格式（只允许字母数字）
    if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      if (hasFrontend) {
        res.sendFile(indexHtmlPath)
      } else {
        res.status(404).json({ detail: '路径不存在' })
      }
      return
    }

    const link = await prisma.shortLink.findUnique({
      where: { shortCode },
    })

    if (!link) {
      // 短链接不存在，尝试返回前端页面
      if (hasFrontend) {
        res.sendFile(indexHtmlPath)
      } else {
        res.status(404).json({ detail: '链接不存在' })
      }
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

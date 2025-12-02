import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import prisma from '../config/database.js'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

// 预设模板
const templates = [
  {
    id: 1,
    name: '简约风格',
    description: '简洁大方的单页设计',
    thumbnail: '',
    html_content: '<div class="container"><h1>欢迎</h1><p>这是您的落地页</p></div>',
    css_content: '.container { text-align: center; padding: 2rem; }',
  },
  {
    id: 2,
    name: '产品展示',
    description: '适合产品推广的落地页',
    thumbnail: '',
    html_content: '<div class="product"><h1>产品名称</h1><p>产品描述</p></div>',
    css_content: '.product { padding: 2rem; text-align: center; }',
  },
]

// 获取模板列表
router.get('/templates', (_req: Request, res: Response) => {
  res.json(templates)
})

// 预览落地页
router.post('/preview', authenticate, (req: Request, res: Response) => {
  const { html_content, css_content } = req.body

  if (!html_content) {
    res.status(400).json({ detail: '缺少 HTML 内容' })
    return
  }

  // 生成完整的预览 HTML
  const previewHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>落地页预览</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${css_content || ''}
  </style>
</head>
<body>
  ${html_content}
</body>
</html>
  `.trim()

  // 将 HTML 转为 base64 data URL
  const base64Html = Buffer.from(previewHtml).toString('base64')
  const previewUrl = `data:text/html;base64,${base64Html}`

  res.json({ preview_url: previewUrl })
})

// 获取落地页
router.get('/:linkId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const linkId = parseInt(req.params.linkId, 10)
    const landingPage = await prisma.landingPage.findUnique({
      where: { linkId },
    })

    if (!landingPage) {
      res.status(404).json({ detail: '落地页不存在' })
      return
    }

    res.json({
      id: landingPage.id,
      link_id: landingPage.linkId,
      html_content: landingPage.htmlContent,
      css_content: landingPage.cssContent,
      template_id: landingPage.templateId,
      is_published: landingPage.isPublished,
      created_at: landingPage.createdAt.toISOString(),
      updated_at: landingPage.updatedAt.toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

// 创建/更新落地页
router.put('/:linkId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const linkId = parseInt(req.params.linkId, 10)
    const { html_content, css_content, is_published } = req.body

    // 验证链接归属
    const link = await prisma.shortLink.findFirst({
      where: { id: linkId, userId: req.user!.id },
    })
    if (!link) {
      res.status(404).json({ detail: '链接不存在' })
      return
    }

    const landingPage = await prisma.landingPage.upsert({
      where: { linkId },
      create: {
        linkId,
        htmlContent: html_content,
        cssContent: css_content,
        isPublished: is_published ?? false,
      },
      update: {
        htmlContent: html_content,
        cssContent: css_content,
        isPublished: is_published,
      },
    })

    res.json({
      id: landingPage.id,
      link_id: landingPage.linkId,
      html_content: landingPage.htmlContent,
      css_content: landingPage.cssContent,
      is_published: landingPage.isPublished,
      created_at: landingPage.createdAt.toISOString(),
      updated_at: landingPage.updatedAt.toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

// 删除落地页
router.delete('/:linkId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const linkId = parseInt(req.params.linkId, 10)

    await prisma.landingPage.delete({
      where: { linkId },
    })

    res.json({ message: '落地页已删除' })
  } catch (error) {
    next(error)
  }
})

// 发布落地页
router.post('/:linkId/publish', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const linkId = parseInt(req.params.linkId, 10)

    const landingPage = await prisma.landingPage.update({
      where: { linkId },
      data: { isPublished: true },
    })

    res.json({
      id: landingPage.id,
      is_published: landingPage.isPublished,
    })
  } catch (error) {
    next(error)
  }
})

// 取消发布
router.post('/:linkId/unpublish', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const linkId = parseInt(req.params.linkId, 10)

    const landingPage = await prisma.landingPage.update({
      where: { linkId },
      data: { isPublished: false },
    })

    res.json({
      id: landingPage.id,
      is_published: landingPage.isPublished,
    })
  } catch (error) {
    next(error)
  }
})

export default router

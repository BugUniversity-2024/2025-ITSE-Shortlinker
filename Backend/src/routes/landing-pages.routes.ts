import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import prisma from '../config/database.js'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

// 预设模板
const templates = [
  {
    id: 1,
    name: 'Gradient Welcome',
    description: 'Modern welcome page with gradient background',
    thumbnail: '',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome</title>
</head>
<body>
  <div class="container">
    <h1>Welcome</h1>
    <p>This is your landing page content</p>
    <a href="#" class="btn">Learn More</a>
  </div>
</body>
</html>`,
    css_content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.container {
  text-align: center;
  color: white;
  padding: 2rem;
}
h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}
p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}
.btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}
.btn:hover {
  transform: scale(1.05);
}`,
  },
  {
    id: 2,
    name: 'Product Showcase',
    description: 'Card-style layout for product promotion',
    thumbnail: '',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Product</title>
</head>
<body>
  <div class="hero">
    <div class="card">
      <div class="badge">NEW</div>
      <h1>Amazing Product</h1>
      <p>Discover our latest innovation that will change your life. Built with passion and precision.</p>
      <div class="features">
        <div class="feature">Fast</div>
        <div class="feature">Reliable</div>
        <div class="feature">Secure</div>
      </div>
      <a href="#" class="cta">Get Started Free</a>
    </div>
  </div>
</body>
</html>`,
    css_content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  min-height: 100vh;
  background: #0f172a;
}
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-radius: 24px;
  padding: 3rem;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}
.badge {
  display: inline-block;
  background: linear-gradient(90deg, #f472b6, #8b5cf6);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
h1 {
  color: white;
  font-size: 2.5rem;
  margin: 0 0 1rem;
}
p {
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.features {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}
.feature {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}
.cta {
  display: inline-block;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}
.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59,130,246,0.3);
}`,
  },
  {
    id: 3,
    name: 'Link Collection',
    description: 'Social media link aggregation page',
    thumbnail: '',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Links</title>
</head>
<body>
  <div class="profile">
    <div class="avatar">JD</div>
    <h1>John Doe</h1>
    <p>Designer & Developer</p>
    <div class="links">
      <a href="#" class="link">Website</a>
      <a href="#" class="link">Portfolio</a>
      <a href="#" class="link">GitHub</a>
      <a href="#" class="link">Twitter</a>
      <a href="#" class="link">Contact Me</a>
    </div>
  </div>
</body>
</html>`,
    css_content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #fef3c7 0%, #fcd34d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile {
  text-align: center;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}
.avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin: 0 auto 1.5rem;
  box-shadow: 0 10px 30px rgba(217,119,6,0.3);
}
h1 {
  color: #78350f;
  font-size: 1.75rem;
  margin: 0 0 0.5rem;
}
p {
  color: #92400e;
  margin: 0 0 2rem;
}
.links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.link {
  display: block;
  background: white;
  color: #78350f;
  padding: 1rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}`,
  },
  {
    id: 4,
    name: 'Event Countdown',
    description: 'Event announcement page with countdown timer',
    thumbnail: '',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Coming Soon</title>
</head>
<body>
  <div class="container">
    <h1>Coming Soon</h1>
    <p>Something amazing is on the way</p>
    <div class="countdown">
      <div class="time-block">
        <span class="number">07</span>
        <span class="label">Days</span>
      </div>
      <div class="time-block">
        <span class="number">12</span>
        <span class="label">Hours</span>
      </div>
      <div class="time-block">
        <span class="number">45</span>
        <span class="label">Minutes</span>
      </div>
      <div class="time-block">
        <span class="number">30</span>
        <span class="label">Seconds</span>
      </div>
    </div>
    <div class="notify">
      <input type="email" placeholder="Enter your email">
      <button>Notify Me</button>
    </div>
  </div>
</body>
</html>`,
    css_content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  text-align: center;
  padding: 2rem;
}
h1 {
  color: #e94560;
  font-size: 3.5rem;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
}
p {
  color: #a1a1aa;
  font-size: 1.25rem;
  margin: 0 0 3rem;
}
.countdown {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
}
.time-block {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  min-width: 80px;
}
.number {
  display: block;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}
.label {
  color: #71717a;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.notify {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
}
.notify input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 1rem;
}
.notify input::placeholder {
  color: #71717a;
}
.notify button {
  padding: 1rem 2rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.notify button:hover {
  background: #dc2626;
}`,
  },
  {
    id: 5,
    name: 'Minimal Card',
    description: 'Minimalist personal business card page',
    thumbnail: '',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contact</title>
</head>
<body>
  <div class="card">
    <div class="info">
      <h1>Sarah Chen</h1>
      <p class="title">Product Designer</p>
      <p class="company">@ TechCorp Inc.</p>
    </div>
    <div class="contact">
      <a href="mailto:sarah@example.com">sarah@example.com</a>
      <a href="tel:+1234567890">+1 (234) 567-890</a>
    </div>
    <div class="social">
      <a href="#">LinkedIn</a>
      <a href="#">Dribbble</a>
      <a href="#">Twitter</a>
    </div>
  </div>
</body>
</html>`,
    css_content: `body {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 320px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}
.info {
  text-align: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}
h1 {
  color: #111;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}
.title {
  color: #666;
  margin: 0 0 0.25rem;
  font-size: 1rem;
}
.company {
  color: #999;
  margin: 0;
  font-size: 0.875rem;
}
.contact {
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.contact a {
  display: block;
  color: #111;
  text-decoration: none;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.contact a:hover {
  color: #3b82f6;
}
.social {
  padding-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.social a {
  color: #999;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.social a:hover {
  color: #111;
}`,
  },
  {
    id: 6,
    name: 'App Download',
    description: 'Mobile app promotion download page',
    thumbnail: '',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Download App</title>
</head>
<body>
  <div class="hero">
    <div class="content">
      <div class="app-icon">App</div>
      <h1>Download Our App</h1>
      <p>Experience the best mobile app for productivity. Available on all platforms.</p>
      <div class="buttons">
        <a href="#" class="store-btn apple">
          <span class="icon">Apple</span>
          <span class="text">
            <small>Download on the</small>
            App Store
          </span>
        </a>
        <a href="#" class="store-btn google">
          <span class="icon">Play</span>
          <span class="text">
            <small>Get it on</small>
            Google Play
          </span>
        </a>
      </div>
      <div class="stats">
        <div class="stat">
          <strong>4.9</strong>
          <span>Rating</span>
        </div>
        <div class="stat">
          <strong>1M+</strong>
          <span>Downloads</span>
        </div>
        <div class="stat">
          <strong>50K+</strong>
          <span>Reviews</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
    css_content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
}
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.content {
  text-align: center;
  max-width: 500px;
}
.app-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 auto 2rem;
  box-shadow: 0 10px 30px rgba(16,185,129,0.3);
}
h1 {
  color: #064e3b;
  font-size: 2.5rem;
  margin: 0 0 1rem;
}
p {
  color: #047857;
  font-size: 1.1rem;
  margin: 0 0 2rem;
  line-height: 1.6;
}
.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}
.store-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  transition: transform 0.2s;
}
.store-btn:hover {
  transform: translateY(-2px);
}
.apple {
  background: #111;
}
.google {
  background: #111;
}
.store-btn .icon {
  font-size: 1.5rem;
}
.store-btn .text {
  text-align: left;
  line-height: 1.2;
}
.store-btn .text small {
  display: block;
  font-size: 0.65rem;
  opacity: 0.8;
}
.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}
.stat {
  text-align: center;
}
.stat strong {
  display: block;
  color: #064e3b;
  font-size: 1.5rem;
}
.stat span {
  color: #047857;
  font-size: 0.875rem;
}`,
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
    res.status(400).json({ detail: 'Missing HTML content' })
    return
  }

  // Generate complete preview HTML
  const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page Preview</title>
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
      res.status(404).json({ detail: 'Landing page not found' })
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
      res.status(404).json({ detail: 'Link not found' })
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

    res.json({ message: 'Landing page deleted' })
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

# Picture 3-13: Landing Page Module Sequence Diagram
# 图 3-13:落地页模块序列图

```mermaid
sequenceDiagram
    participant Client as 客户端<br>Client
    participant Controller as 控制器<br>LandingPageController
    participant Service as 服务层<br>LandingPageService
    participant Repository as 仓储层<br>LandingPageRepository
    participant Sanitizer as DOMPurify<br>HTML 清理
    participant Redis as Redis<br>缓存
    participant DB as PostgreSQL<br>数据库

    Note over Client,DB: 创建落地页流程 Create Landing Page

    Client->>Controller: POST /api/landing-pages<br>{link_id, html_content, css_content, template_id}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Link Ownership

    Controller->>Service: createLandingPage(user_id, data)

    Service->>Repository: findLinkById(link_id)
    Repository->>DB: SELECT * FROM short_links<br>WHERE id = ? AND user_id = ?
    DB-->>Repository: Link Object
    Repository-->>Service: Link Object

    alt 链接不存在或无权限 Link Not Found or Unauthorized
        Service-->>Controller: Error: Not Found
        Controller-->>Client: 404 Not Found
    else 继续创建 Continue Creation
        Service->>Sanitizer: sanitize(html_content)
        Sanitizer->>Sanitizer: 移除恶意脚本<br>Remove Malicious Scripts
        Sanitizer->>Sanitizer: 验证标签白名单<br>Validate Tag Whitelist
        Sanitizer-->>Service: Cleaned HTML

        Service->>Sanitizer: sanitize(css_content)
        Sanitizer->>Sanitizer: 移除恶意样式<br>Remove Malicious Styles
        Sanitizer-->>Service: Cleaned CSS

        Service->>Repository: create({link_id, html_content, css_content, template_id})
        Repository->>DB: INSERT INTO landing_pages<br>(link_id, html_content, css_content,<br>template_id, created_at)
        DB-->>Repository: Landing Page ID: 98765
        Repository-->>Service: Landing Page Object

        Service->>Redis: SET landingpage:{link_id}<br>html_content<br>TTL: 24h
        Redis-->>Service: OK

        Service-->>Controller: Landing Page Object
        Controller-->>Client: 201 Created<br>{landing_page: {...}}
    end

    Note over Client,DB: 获取落地页编辑器 Get Landing Page Editor

    Client->>Controller: GET /api/landing-pages/:link_id/editor
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Ownership

    Controller->>Service: getEditorData(link_id, user_id)

    Service->>Repository: findByLinkId(link_id)
    Repository->>DB: SELECT * FROM landing_pages<br>WHERE link_id = ?
    DB-->>Repository: Landing Page Object (or null)
    Repository-->>Service: Landing Page Object

    alt 已有落地页 Existing Landing Page
        Service-->>Controller: {<br>  html_content,<br>  css_content,<br>  template_id<br>}
        Controller-->>Client: 200 OK<br>{landing_page: {...}}
    else 无落地页,返回空模板 No Landing Page, Return Empty Template
        Service->>Service: 加载默认模板<br>Load Default Template
        Service-->>Controller: {<br>  html_content: default_template,<br>  css_content: default_styles,<br>  template_id: null<br>}
        Controller-->>Client: 200 OK<br>{landing_page: {...}}
    end

    Note over Client,DB: 更新落地页 Update Landing Page

    Client->>Controller: PUT /api/landing-pages/:link_id<br>{html_content, css_content}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Ownership

    Controller->>Service: updateLandingPage(link_id, user_id, data)

    Service->>Repository: findByLinkId(link_id)
    Repository->>DB: SELECT * FROM landing_pages<br>WHERE link_id = ?
    DB-->>Repository: Landing Page Object
    Repository-->>Service: Landing Page Object

    Service->>Sanitizer: sanitize(html_content)
    Sanitizer-->>Service: Cleaned HTML

    Service->>Sanitizer: sanitize(css_content)
    Sanitizer-->>Service: Cleaned CSS

    Service->>Repository: update(link_id, {html_content, css_content, updated_at})
    Repository->>DB: UPDATE landing_pages<br>SET html_content = ?,<br>    css_content = ?,<br>    updated_at = NOW()<br>WHERE link_id = ?
    DB-->>Repository: Updated Landing Page
    Repository-->>Service: Landing Page Object

    Service->>Redis: SET landingpage:{link_id}<br>html_content<br>TTL: 24h
    Redis-->>Service: OK

    Service-->>Controller: Updated Landing Page
    Controller-->>Client: 200 OK<br>{landing_page: {...}}

    Note over Client,DB: 渲染落地页 Render Landing Page

    Client->>Controller: GET /l/:short_code
    Controller->>Service: renderLandingPage(short_code)

    Service->>Redis: GET landingpage:code:{short_code}
    alt 缓存命中 Cache Hit
        Redis-->>Service: Cached HTML
        Service-->>Controller: Full HTML
        Controller-->>Client: 200 OK<br>Content-Type: text/html<br><!DOCTYPE html>...
    else 缓存未命中 Cache Miss
        Service->>Repository: findLinkByShortCode(short_code)
        Repository->>DB: SELECT * FROM short_links<br>WHERE short_code = ?
        DB-->>Repository: Link Object
        Repository-->>Service: Link Object

        Service->>Repository: findByLinkId(link.id)
        Repository->>DB: SELECT * FROM landing_pages<br>WHERE link_id = ?
        DB-->>Repository: Landing Page Object
        Repository-->>Service: Landing Page Object

        alt 无落地页 No Landing Page
            Service->>Service: 直接重定向<br>Redirect Directly
            Service-->>Controller: Redirect to original_url
            Controller-->>Client: 302 Redirect<br>Location: {original_url}
        else 有落地页 Has Landing Page
            Service->>Service: 构建完整 HTML<br>Build Full HTML<br>(head + body + styles)
            Service->>Service: 注入统计脚本<br>Inject Analytics Script

            Service->>Redis: SET landingpage:code:{short_code}<br>full_html<br>TTL: 24h
            Redis-->>Service: OK

            Service-->>Controller: Full HTML
            Controller-->>Client: 200 OK<br>Content-Type: text/html<br><!DOCTYPE html>...
        end
    end

    Note over Client,DB: 预览落地页 Preview Landing Page

    Client->>Controller: POST /api/landing-pages/preview<br>{html_content, css_content}
    Controller->>Controller: 验证 JWT<br>Verify JWT

    Controller->>Service: previewLandingPage(html, css)

    Service->>Sanitizer: sanitize(html_content)
    Sanitizer-->>Service: Cleaned HTML

    Service->>Sanitizer: sanitize(css_content)
    Sanitizer-->>Service: Cleaned CSS

    Service->>Service: 构建预览 HTML<br>Build Preview HTML
    Service-->>Controller: Preview HTML

    Controller-->>Client: 200 OK<br>Content-Type: text/html<br><!DOCTYPE html>...

    Note over Client,DB: 删除落地页 Delete Landing Page

    Client->>Controller: DELETE /api/landing-pages/:link_id
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Ownership

    Controller->>Service: deleteLandingPage(link_id, user_id)

    Service->>Repository: findByLinkId(link_id)
    Repository->>DB: SELECT * FROM landing_pages<br>WHERE link_id = ?
    DB-->>Repository: Landing Page Object
    Repository-->>Service: Landing Page Object

    Service->>Repository: delete(link_id)
    Repository->>DB: DELETE FROM landing_pages<br>WHERE link_id = ?
    DB-->>Repository: OK
    Repository-->>Service: Success

    Service->>Repository: findLinkById(link_id)
    Repository->>DB: SELECT short_code<br>FROM short_links<br>WHERE id = ?
    DB-->>Repository: {short_code}
    Repository-->>Service: {short_code}

    Service->>Redis: DEL landingpage:{link_id}
    Service->>Redis: DEL landingpage:code:{short_code}
    Redis-->>Service: OK

    Service-->>Controller: {success: true}
    Controller-->>Client: 204 No Content

    style Client fill:#E3F2FD
    style Controller fill:#C8E6C9
    style Service fill:#FFF9C4
    style Repository fill:#FFE0B2
    style Sanitizer fill:#E1BEE7
    style Redis fill:#FFCCBC
    style DB fill:#F8BBD0
```

## 模块说明

### 🎨 落地页模块核心功能

落地页模块负责处理自定义HTML/CSS的创建、编辑、渲染和安全防护。

---

### 1️⃣ HTML/CSS 清理 (XSS 防护)

```typescript
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// 服务端使用 JSDOM 创建 DOMPurify 实例
const window = new JSDOM('').window
const purify = DOMPurify(window)

function sanitizeHTML(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'a', 'img', 'button', 'ul', 'ol', 'li',
      'br', 'hr', 'strong', 'em', 'u', 'section', 'article',
      'header', 'footer', 'nav', 'main'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'href', 'src', 'alt', 'title',
      'width', 'height', 'style', 'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/,  // 仅允许 https/http/mailto
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  })
}

function sanitizeCSS(css: string): string {
  // 移除潜在的恶意 CSS
  const dangerousPatterns = [
    /@import/gi,              // 禁止 @import
    /javascript:/gi,          // 禁止 javascript:
    /expression\(/gi,         // 禁止 CSS expression (IE)
    /behavior:/gi,            // 禁止 behavior (IE)
    /<script/gi               // 禁止嵌入 <script>
  ]

  let cleanCSS = css
  dangerousPatterns.forEach(pattern => {
    cleanCSS = cleanCSS.replace(pattern, '')
  })

  return cleanCSS
}

// 使用示例
async function createLandingPage(data: any) {
  const cleanHTML = sanitizeHTML(data.html_content)
  const cleanCSS = sanitizeCSS(data.css_content)

  // 保存到数据库
  return await landingPageRepository.create({
    link_id: data.link_id,
    html_content: cleanHTML,
    css_content: cleanCSS,
    template_id: data.template_id
  })
}
```

---

### 2️⃣ 模板系统

```typescript
// 预设模板配置
const TEMPLATES = {
  product: {
    id: 1,
    name: 'Product Page',
    category: '产品介绍',
    html: `
      <div class="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div class="container mx-auto px-4">
          <h1 class="text-5xl font-bold mb-4">{{product_title}}</h1>
          <p class="text-xl mb-8">{{product_description}}</p>
          <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            {{cta_button_text}}
          </button>
        </div>
      </div>
      <div class="container mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="feature-card">
            <h3 class="text-2xl font-bold mb-2">{{feature_1_title}}</h3>
            <p>{{feature_1_description}}</p>
          </div>
          <div class="feature-card">
            <h3 class="text-2xl font-bold mb-2">{{feature_2_title}}</h3>
            <p>{{feature_2_description}}</p>
          </div>
          <div class="feature-card">
            <h3 class="text-2xl font-bold mb-2">{{feature_3_title}}</h3>
            <p>{{feature_3_description}}</p>
          </div>
        </div>
      </div>
    `,
    css: `
      .feature-card {
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }
      .feature-card:hover {
        transform: translateY(-5px);
      }
    `
  },
  event: {
    id: 2,
    name: 'Event Promotion',
    category: '活动推广',
    html: `
      <div class="event-header text-center py-16 bg-gradient-to-br from-pink-400 to-orange-500 text-white">
        <h1 class="text-6xl font-bold mb-4">{{event_title}}</h1>
        <p class="text-2xl mb-8">{{event_date}}</p>
        <div class="countdown text-4xl font-mono">
          <span id="countdown">{{countdown}}</span>
        </div>
      </div>
      <div class="container mx-auto px-4 py-16">
        <div class="event-details">
          <h2 class="text-3xl font-bold mb-4">活动详情</h2>
          <p class="text-lg">{{event_description}}</p>
        </div>
        <div class="register-button text-center mt-12">
          <button class="bg-orange-500 text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-orange-600">
            {{register_button_text}}
          </button>
        </div>
      </div>
    `,
    css: `
      .countdown {
        background: rgba(255, 255, 255, 0.2);
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        display: inline-block;
      }
      .register-button button {
        box-shadow: 0 10px 25px rgba(255, 87, 34, 0.3);
        transition: all 0.3s;
      }
      .register-button button:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(255, 87, 34, 0.4);
      }
    `
  }
}

// 获取模板
function getTemplate(templateId: number) {
  return Object.values(TEMPLATES).find(t => t.id === templateId)
}

// 渲染模板 (替换占位符)
function renderTemplate(template: any, data: Record<string, string>): string {
  let html = template.html

  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`
    html = html.replace(new RegExp(placeholder, 'g'), data[key])
  })

  return html
}
```

---

### 3️⃣ 落地页渲染

```typescript
async function renderLandingPage(shortCode: string): Promise<string> {
  // 1. 尝试从缓存获取
  const cached = await redis.get(`landingpage:code:${shortCode}`)
  if (cached) {
    return cached
  }

  // 2. 查询短链接
  const link = await linkRepository.findByShortCode(shortCode)
  if (!link) {
    throw new Error('链接不存在')
  }

  // 3. 查询落地页
  const landingPage = await landingPageRepository.findByLinkId(link.id)

  if (!landingPage) {
    // 无落地页,直接重定向
    return null  // Controller 层会处理重定向
  }

  // 4. 构建完整 HTML
  const fullHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TinyBridge Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${landingPage.css_content}
  </style>
</head>
<body>
  ${landingPage.html_content}

  <!-- 统计脚本 -->
  <script>
    // 记录页面访问
    fetch('/api/analytics/landing-page-view', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        short_code: '${shortCode}',
        timestamp: new Date().toISOString()
      })
    })
  </script>
</body>
</html>
  `

  // 5. 缓存 24 小时
  await redis.set(`landingpage:code:${shortCode}`, fullHTML, 'EX', 24 * 3600)

  return fullHTML
}
```

---

### 4️⃣ 实时预览

```typescript
async function previewLandingPage(html: string, css: string): Promise<string> {
  // 清理 HTML/CSS
  const cleanHTML = sanitizeHTML(html)
  const cleanCSS = sanitizeCSS(css)

  // 构建预览页面
  const previewHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览 - TinyBridge Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cleanCSS}
  </style>
</head>
<body>
  <!-- 预览标识 -->
  <div style="position: fixed; top: 0; left: 0; right: 0; background: #FFA500; color: white; text-align: center; padding: 0.5rem; z-index: 9999; font-weight: bold;">
    预览模式 Preview Mode
  </div>

  <div style="padding-top: 3rem;">
    ${cleanHTML}
  </div>

  <!-- 禁用所有链接跳转 (预览模式) -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault()
          alert('预览模式下链接已禁用')
        })
      })

      document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          alert('预览模式下按钮操作已禁用')
        })
      })
    })
  </script>
</body>
</html>
  `

  return previewHTML
}
```

---

### 5️⃣ 落地页编辑器集成 (Monaco Editor)

```typescript
// 前端: 使用 Monaco Editor (VS Code 的编辑器)
import * as monaco from 'monaco-editor'

// 初始化 HTML 编辑器
const htmlEditor = monaco.editor.create(document.getElementById('html-editor'), {
  value: landingPageData.html_content,
  language: 'html',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: false },
  formatOnPaste: true,
  formatOnType: true
})

// 初始化 CSS 编辑器
const cssEditor = monaco.editor.create(document.getElementById('css-editor'), {
  value: landingPageData.css_content,
  language: 'css',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: false }
})

// 实时预览 (防抖)
let previewTimeout
function updatePreview() {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(async () => {
    const html = htmlEditor.getValue()
    const css = cssEditor.getValue()

    const response = await fetch('/api/landing-pages/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ html_content: html, css_content: css })
    })

    const previewHTML = await response.text()
    const iframe = document.getElementById('preview-iframe')
    iframe.srcdoc = previewHTML
  }, 500)  // 500ms 防抖
}

// 监听编辑器变化
htmlEditor.onDidChangeModelContent(() => {
  updatePreview()
})

cssEditor.onDidChangeModelContent(() => {
  updatePreview()
})
```

---

### 🔒 安全措施

| 措施 | 实现方式 |
|------|----------|
| **XSS 防护** | DOMPurify 清理所有 HTML/CSS |
| **标签白名单** | 仅允许安全的 HTML 标签 |
| **属性过滤** | 禁止 `onerror`/`onclick` 等事件属性 |
| **URL 验证** | 仅允许 `http`/`https`/`mailto` 协议 |
| **CSS 清理** | 移除 `@import`/`expression`/`behavior` |
| **权限验证** | 验证用户对链接的所有权 |
| **内容大小限制** | HTML < 500KB, CSS < 100KB |

---

### ⚡ 性能优化

| 策略 | 效果 |
|------|------|
| **Redis 缓存** | 完整 HTML 缓存 24h,减少 DB 查询 |
| **CDN 加载** | TailwindCSS 从 CDN 加载 |
| **预览防抖** | 500ms 防抖,避免频繁请求 |
| **gzip 压缩** | Nginx 启用 gzip,减少传输大小 |

---

### 🎨 TailwindCSS 集成

```html
<!-- 落地页中使用 TailwindCSS -->
<div class="container mx-auto px-4 py-16">
  <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">
    SCNU Programming Competition 2025
  </h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 class="text-xl font-semibold mb-2">🏆 丰厚奖金</h3>
      <p class="text-gray-600">冠军奖金 ¥10,000 + 荣誉证书</p>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 class="text-xl font-semibold mb-2">🎓 学习机会</h3>
      <p class="text-gray-600">与顶尖选手交流,提升编程技能</p>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 class="text-xl font-semibold mb-2">🌟 实习机会</h3>
      <p class="text-gray-600">优秀选手获得名企实习推荐</p>
    </div>
  </div>

  <div class="text-center mt-12">
    <a href="https://example.com/register" class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition">
      立即报名
    </a>
  </div>
</div>
```

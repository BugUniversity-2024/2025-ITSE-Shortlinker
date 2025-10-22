# Picture 2-17: Use Case Diagram of Landing Page Editing
# 图 2-17:落地页编辑的用例图

```mermaid
graph TB
    User([用户<br>User])
    Visitor([访客<br>Visitor])

    subgraph "落地页编辑系统<br>Landing Page Editor System"
        BrowseTemplates[浏览模板库<br>Browse Templates]
        SelectTemplate[选择模板<br>Select Template]
        EditContent[编辑内容<br>Edit Content]
        CustomizeStyle[自定义样式<br>Customize Style]
        PreviewPage[实时预览<br>Real-time Preview]
        PublishPage[发布落地页<br>Publish Page]
        UnpublishPage[取消发布<br>Unpublish Page]
        ExportHTML[导出HTML<br>Export HTML]
        CodeEditor[代码编辑器<br>Code Editor]
    end

    TemplateLibrary[模板库<br>Template Library]
    MonacoEditor[Monaco编辑器<br>Monaco Editor]
    DOMPurify[HTML清理器<br>DOMPurify]
    Database[(数据库<br>Database)]
    Redis[(Redis<br>缓存)]

    User -->|浏览| BrowseTemplates
    User -->|选择| SelectTemplate
    User -->|编辑| EditContent
    User -->|自定义| CustomizeStyle
    User -->|预览| PreviewPage
    User -->|发布| PublishPage
    User -->|取消发布| UnpublishPage
    User -->|导出| ExportHTML
    User -->|高级编辑| CodeEditor

    Visitor -->|访问落地页| PreviewPage

    BrowseTemplates -->|加载模板| TemplateLibrary
    SelectTemplate -->|应用模板| TemplateLibrary

    EditContent ..>|可选| CodeEditor
    CodeEditor -->|使用| MonacoEditor

    CustomizeStyle -->|调整颜色| CustomizeStyle
    CustomizeStyle -->|修改布局| CustomizeStyle

    EditContent -->|实时更新| PreviewPage
    CustomizeStyle -->|实时更新| PreviewPage

    PublishPage -->|清理HTML| DOMPurify
    PublishPage -->|保存内容| Database
    PublishPage -->|缓存页面| Redis

    UnpublishPage -->|删除内容| Database
    UnpublishPage -->|清除缓存| Redis

    ExportHTML -->|生成文件| ExportHTML

    style User fill:#10B981,color:#fff
    style Visitor fill:#F59E0B,color:#fff
    style BrowseTemplates fill:#8B5CF6,color:#fff
    style SelectTemplate fill:#3B82F6,color:#fff
    style EditContent fill:#3B82F6,color:#fff
    style CustomizeStyle fill:#8B5CF6,color:#fff
    style PreviewPage fill:#F59E0B,color:#fff
    style PublishPage fill:#10B981,color:#fff
    style UnpublishPage fill:#EF4444,color:#fff
    style ExportHTML fill:#EC4899,color:#fff
    style CodeEditor fill:#6366F1,color:#fff
    style TemplateLibrary fill:#EC4899,color:#fff
    style MonacoEditor fill:#6366F1,color:#fff
    style DOMPurify fill:#EF4444,color:#fff
    style Database fill:#6366F1,color:#fff
    style Redis fill:#EF4444,color:#fff
```

## 模板库

### 预设模板分类

| 类别 | 模板名称 | 使用场景 |
|------|----------|----------|
| **产品介绍** | Product Showcase | 产品发布、功能展示 |
| **活动推广** | Event Promotion | 校园活动、线下聚会 |
| **表单收集** | Form Collection | 问卷调查、报名登记 |
| **公告通知** | Announcement | 重要通知、系统维护 |
| **倒计时** | Countdown Timer | 活动倒计时、限时优惠 |

---

## 编辑模式

### 1. 表单编辑器 (Form Editor)
**适合**: 普通用户,无代码基础

**可编辑字段**:
- 标题文本
- 描述段落
- 按钮文字
- 背景颜色
- 图片上传

**示例界面**:
```
┌────────────────────────────────┐
│ 标题: [活动主题______]          │
│ 描述: [活动详情______]          │
│ 按钮: [立即报名______]          │
│ 颜色: [🎨 蓝色 ▼]              │
│ 图片: [📁 上传图片]             │
└────────────────────────────────┘
```

---

### 2. 代码编辑器 (Monaco Editor)
**适合**: 高级用户,熟悉 HTML/CSS

**特性**:
- 语法高亮
- 自动补全
- 错误提示
- Emmet 快捷键

**示例**:
```html
<div class="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
  <div class="container mx-auto px-4">
    <h1 class="text-5xl font-bold mb-4">{{ event_title }}</h1>
    <p class="text-xl mb-8">{{ event_description }}</p>
    <button class="bg-white text-blue-600 px-8 py-3 rounded-lg">
      {{ cta_button }}
    </button>
  </div>
</div>
```

---

## 实时预览

### 双栏布局
```
┌─────────────────┬─────────────────┐
│                 │                 │
│   编辑器面板     │   实时预览      │
│                 │                 │
│ [表单编辑器]     │ [落地页渲染]     │
│   or           │                 │
│ [代码编辑器]     │                 │
│                 │                 │
│ [保存] [发布]    │ [📱桌面 📱移动] │
│                 │                 │
└─────────────────┴─────────────────┘
```

### 响应式预览
- **桌面视图**: 1920x1080
- **平板视图**: 768x1024
- **移动视图**: 375x667

---

## 发布流程

```
编辑完成
    ↓
点击"发布"
    ↓
DOMPurify 清理 HTML/CSS
  - 移除 <script> 标签
  - 移除 onclick 等事件
  - 验证 URL 协议
    ↓
保存到数据库 (landing_pages 表)
    ↓
缓存到 Redis (TTL: 24h)
    ↓
发布成功
    ↓
落地页可通过 /l/{short_code} 访问
```

---

## 安全措施

### XSS 防护

**允许的 HTML 标签**:
```
div, p, h1-h6, span, a, img, button, ul, ol, li,
br, hr, strong, em, u, section, article, header,
footer, nav, main
```

**允许的 HTML 属性**:
```
class, id, href, src, alt, title, width, height,
style, target, rel
```

**禁止的内容**:
```
<script>, <iframe>, <object>, <embed>
onerror, onload, onclick, onmouseover
javascript:, data:, vbscript:
```

---

## 导出 HTML

**导出内容**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TinyBridge Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* 自定义 CSS */
  </style>
</head>
<body>
  <!-- 自定义 HTML -->
</body>
</html>
```

**使用场景**:
- 在自己的服务器托管
- 嵌入现有网站
- 离线展示

---

## 使用示例

### 场景: SCNU 编程竞赛落地页

**模板**: Event Promotion

**自定义内容**:
- 标题: "SCNU Programming Competition 2025"
- 描述: "华南师范大学年度编程大赛,挑战自我,赢取万元奖金!"
- 倒计时: 距离比赛开始还有 15 天
- 按钮: "立即报名"
- 背景: 渐变蓝紫色

**访问方式**:
- 短链接: `https://tinybridge.link/scnu2025`
- 落地页: `https://tinybridge.link/l/scnu2025`

**效果**:
- 访客先看到精美的活动介绍页面
- 点击"立即报名"跳转到实际报名表单
- 降低跳出率,提高转化率

---

## 性能优化

| 优化项 | 实现方式 | 效果 |
|--------|----------|------|
| **CDN 加载** | TailwindCSS 从 CDN 加载 | 减少服务器负担 |
| **页面缓存** | Redis 缓存完整 HTML (24h) | 加载时间 < 100ms |
| **代码压缩** | Minify HTML/CSS | 文件大小减少 40% |
| **图片优化** | WebP 格式 + 懒加载 | 加载速度提升 60% |

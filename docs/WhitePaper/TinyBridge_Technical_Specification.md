# TinyBridge 技术方案规划文档

> **项目名称**：TinyBridge - 短链接管理平台
> **文档类型**：技术方案与开发规划
> **创建日期**：2025-10-21
> **版本**：v1.0

---

## 📋 项目概览

### 项目定位
TinyBridge 是一个面向校园组织、中小企业和个人内容创作者的**短链接管理平台**，提供：
- 自定义短链接生成与管理
- 实时数据分析与可视化
- QR 码生成
- 批量操作 API
- 可视化落地页编辑器
- 团队协作功能

### 技术栈选型

| 技术层 | 技术选型 | 说明 |
|--------|---------|------|
| **前端框架** | Vue3 + Vite | 现代化前端构建工具 |
| **UI 组件库** | TailwindCSS + Headless UI | 实用优先的 CSS 框架 |
| **状态管理** | Pinia | Vue3 官方推荐状态管理工具 |
| **后端框架** | Node.js (TypeScript) | 类型安全的 JavaScript 运行时 |
| **数据库** | SQLite (开发) / PostgreSQL (生产) | 轻量级开发 + 生产级数据库 |
| **ORM 框架** | Prisma / TypeORM | 类型安全的数据库 CRUD 操作 |
| **缓存系统** | Redis | 高性能内存数据库，用于短链接重定向加速 |
| **认证方案** | JWT + Argon2 | Token 认证 + 密码散列 |

---

## 🏗️ 系统架构设计

### 当前架构：RESTful API（前后端分离）

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                               │
│  Web Browser (Vue3 + Vite + TailwindCSS)                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS (JSON)
┌────────────────────▼────────────────────────────────────────┐
│                    API Gateway                               │
│              (Node.js + Express/Fastify)                     │
└──┬────────┬─────────┬─────────┬──────────┬─────────┬────────┘
   │        │         │         │          │         │
   ▼        ▼         ▼         ▼          ▼         ▼
┌──────┐┌──────┐┌──────────┐┌──────────┐┌──────┐┌──────┐
│ User ││ Link ││Analytics ││LandingPage││ Team ││ API  │
│Module││Module││  Module  ││  Module  ││Module││ Mgmt │
└──┬───┘└──┬───┘└────┬─────┘└────┬─────┘└──┬───┘└──┬───┘
   │       │         │           │         │       │
   └───────┴─────────┴───────────┴─────────┴───────┘
                      │
            ┌─────────▼─────────┐
            │   Redis Cache     │  ← 短链接映射缓存
            └─────────┬─────────┘
                      │
            ┌─────────▼─────────┐
            │  PostgreSQL DB    │  ← 持久化存储
            └───────────────────┘
```

### 未来规划：微服务架构（可扩展性考虑）

```
                    ┌─────────────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
┌─────▼─────┐      ┌──────▼──────┐      ┌─────▼─────┐
│   User    │      │    Link     │      │ Analytics │
│  Service  │      │   Service   │      │  Service  │
└───────────┘      └─────────────┘      └───────────┘
      │                    │                    │
      └────────────────────┼────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Shared Redis│
                    │ + Database  │
                    └─────────────┘
```

---

## 📊 数据库设计（E-R 模型）

### 核心实体表

#### 1. User（用户表）
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Argon2 散列
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Team（团队表）
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. ShortLink（短链接表）
```sql
CREATE TABLE short_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,  -- 短码
  custom_domain VARCHAR(100),              -- 自定义域名
  custom_path VARCHAR(100),                -- 自定义路径
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,                    -- 过期时间
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_short_code ON short_links(short_code);
```

#### 4. ClickLog（点击日志表）
```sql
CREATE TABLE click_logs (
  id SERIAL PRIMARY KEY,
  link_id INTEGER REFERENCES short_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_hash VARCHAR(64),                     -- IP 匿名化 (SHA256)
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(50),                     -- 通过 IP 解析
  city VARCHAR(100),
  device_type VARCHAR(20),                 -- mobile/desktop/tablet
  browser VARCHAR(50),
  os VARCHAR(50)
);

CREATE INDEX idx_link_id ON click_logs(link_id);
CREATE INDEX idx_clicked_at ON click_logs(clicked_at);
```

#### 5. LandingPage（落地页表）
```sql
CREATE TABLE landing_pages (
  id SERIAL PRIMARY KEY,
  link_id INTEGER REFERENCES short_links(id) ON DELETE CASCADE,
  html_content TEXT,
  css_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. APIKey（API 密钥表）
```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,          -- API Key 散列
  permissions JSON,                         -- {"read": true, "write": true}
  rate_limit INTEGER DEFAULT 1000,         -- 每小时调用次数限制
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

### 实体关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| User → ShortLink | 1:N | 一个用户可以创建多个短链接 |
| Team → ShortLink | 1:N | 一个团队可以管理多个短链接 |
| ShortLink → ClickLog | 1:N | 一个短链接有多条点击记录 |
| ShortLink → LandingPage | 1:1 | 一个短链接可以有一个落地页 |
| User → APIKey | 1:N | 一个用户可以有多个 API 密钥 |

---

## 🎯 功能需求模块（按用户流程划分）

### 2.1.1 Login and Registration（登录与注册）
**功能描述**：
- 用户注册（邮箱 + 密码）
- 用户登录（JWT Token 认证）
- 找回密码
- 邮箱验证（可选）

**技术实现**：
- JWT Token 有效期：24 小时
- Argon2 密码散列（防止彩虹表攻击）
- 登录失败次数限制（5 次/小时）

---

### 2.1.2 Short Link Creation and Management（创建和管理短链接）
**功能描述**：
- 创建短链接（随机生成或自定义短码）
- 编辑短链接（修改目标 URL、过期时间）
- 删除短链接
- 批量管理（启用/禁用/删除）
- 自定义域名和路径前缀

**技术实现**：
- 短码生成算法：Base62 编码（0-9, a-z, A-Z）
- Bloom Filter 检测短码冲突（时间复杂度 O(1)）
- Redis 缓存短链接映射（重定向响应时间 < 100ms）

**短码生成示例**：
```typescript
function generateShortCode(length = 6): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
```

---

### 2.1.3 QR Code Generation（生成 QR 码）
**功能描述**：
- 根据短链接自动生成 QR 码
- 支持自定义 QR 码样式（颜色、尺寸）
- 下载 QR 码图片（PNG/SVG）

**技术实现**：
- 前端渲染（使用 `qrcode` 库，无需后端存储）
- 动态 QR 码：修改目标 URL 不需要重新生成 QR 码

---

### 2.1.4 Click Statistics and Analysis（点击统计与分析）
**功能描述**：
- 实时点击统计（总点击量、唯一访客）
- 地域分布分析（国家、城市）
- 设备类型分析（移动端/桌面端/平板）
- 浏览器和操作系统分布
- 来源分析（Referrer）
- 时间趋势图（按天/周/月）

**技术实现**：
- IP 地址匿名化（SHA256 哈希，符合 GDPR）
- 异步日志记录（不阻塞重定向）
- 数据聚合查询（PostgreSQL + Redis 缓存）

---

### 2.1.5 Batch Operations via API（通过 API 进行批量操作）
**功能描述**：
- 批量创建短链接（CSV/JSON 导入）
- 批量导出链接数据
- API 密钥管理（创建、撤销、刷新）
- API 调用限流（每小时 1,000 次）

**技术实现**：
- RESTful API 设计
- API Key 认证（Header: `Authorization: Bearer <api_key>`）
- 限流策略：Redis + Sliding Window 算法

---

### 2.1.6 Landing Page Editing（落地页编辑）
**功能描述**：
- 可视化编辑落地页（HTML/CSS）
- 模板库（预设模板）
- 实时预览
- 发布/撤销发布

**技术实现**：
- 前端：Monaco Editor（VS Code 同款编辑器）
- 后端：存储 HTML/CSS 到数据库
- 渲染：服务端渲染（SSR）或客户端渲染

---

## ⚙️ 非功能需求

### 2.2.1 Performance Requirements（性能需求）

| 指标 | 目标值 | 实现方式 |
|------|--------|---------|
| **短链接重定向响应时间** | < 100ms | Redis 缓存 + Bloom Filter |
| **并发处理能力** | 5,000 请求/秒 | 水平扩展 + 负载均衡 |
| **页面加载时间** | < 2s | Vite 构建优化 + CDN |
| **数据分析查询响应** | < 2s | PostgreSQL 索引 + Redis 缓存 |

**性能优化策略**：
1. **Redis 缓存层**：
   - 缓存短链接映射（`short_code → original_url`）
   - 缓存热点数据（点击统计）
   - TTL：24 小时，自动过期
2. **Bloom Filter**：
   - 快速检测短码是否存在（误判率 < 0.01%）
   - 减少数据库查询次数
3. **数据库索引**：
   - `short_links.short_code`（唯一索引）
   - `click_logs.link_id` + `clicked_at`（复合索引）

---

### 2.2.2 Scalability Requirements（可扩展性需求）

**水平扩展**：
- 使用 Nginx/Caddy 作为负载均衡器
- 无状态后端服务（Session 存储在 Redis）
- 数据库读写分离（主从复制）

**数据库迁移**：
- 开发环境：SQLite（轻量级，快速启动）
- 生产环境：PostgreSQL（支持高并发、ACID 事务）

---

### 2.2.3 Security Requirements（安全需求）

| 安全措施 | 实现方式 |
|---------|---------|
| **JWT 认证** | Token 有效期 24 小时，Refresh Token 7 天 |
| **密码散列** | Argon2（2019 Password Hashing Competition 冠军） |
| **恶意 URL 检测** | Google Safe Browsing API / VirusTotal API |
| **XSS 防护** | Content Security Policy (CSP) |
| **SQL Injection 防护** | ORM 框架（Prisma/TypeORM）参数化查询 |
| **IP 匿名化** | SHA256 哈希（符合 GDPR/CCPA） |
| **API 限流** | Redis + Sliding Window（1,000 次/小时） |

---

### 2.2.4 Availability Requirements（可用性需求）

- **系统可用性**：99.5%（年停机时间约 43.8 小时）
- **故障恢复时间**：< 2 小时
- **监控方案**：Prometheus + Grafana / Sentry

---

### 2.2.5 Maintainability Requirements（可维护性需求）

- **TypeScript 类型安全**：减少运行时错误
- **模块化设计**：Controller - Service - Repository 三层架构
- **日志系统**：Winston / Pino（结构化日志）
- **代码规范**：ESLint + Prettier
- **版本控制**：Git + GitHub

---

### 2.2.6 Compatibility Requirements（兼容性需求）

- **浏览器支持**：Chrome, Firefox, Safari, Edge（最新两个版本）
- **操作系统**：Windows, macOS, Linux
- **移动端响应式**：支持手机、平板访问（TailwindCSS 响应式设计）

---

### 2.2.7 Usability Requirements（易用性需求）

- **UI 框架**：TailwindCSS + Headless UI
- **一键复制链接**：clipboard.js
- **批量导入/导出**：支持 CSV/JSON 格式
- **快捷键支持**：`Ctrl+K` 打开搜索，`Ctrl+N` 创建新链接

---

### 2.2.8 Reliability Requirements（可靠性需求）

- **数据一致性**：PostgreSQL 事务保证 ACID
- **自动备份**：
  - 每日增量备份（保留 7 天）
  - 每周全量备份（保留 4 周）
- **灾难恢复**：Point-in-Time Recovery (PITR)

---

## 🖥️ 前端页面结构

### 页面列表（7 个核心页面）

| 页面名称 | 路由 | 功能描述 |
|---------|------|---------|
| **Product Landing Page** | `/` | 产品介绍、功能展示、注册入口 |
| **Login/Register Page** | `/login`, `/register` | 用户登录、注册、找回密码 |
| **Dashboard** | `/dashboard` | 短链接列表、快速创建入口 |
| **Link Creation/Edit** | `/links/new`, `/links/:id/edit` | 创建/编辑短链接 |
| **Analytics Dashboard** | `/links/:id/analytics` | 点击统计、数据分析可视化 |
| **Landing Page Editor** | `/links/:id/landing` | 可视化编辑落地页 |
| **Settings** | `/settings` | 团队管理、API 密钥、批量操作 |

### 前端技术选型

| 技术 | 用途 |
|------|------|
| **Vue3 Composition API** | 组件逻辑复用 |
| **Vue Router** | 前端路由 |
| **Pinia** | 状态管理 |
| **TailwindCSS** | 原子化 CSS |
| **Headless UI** | 无样式 UI 组件 |
| **Chart.js / ECharts** | 数据可视化 |
| **Monaco Editor** | 代码编辑器（落地页编辑） |
| **clipboard.js** | 一键复制 |

---

## 🔧 后端模块结构（5 个核心模块）

### 1. User Module（用户模块）
**功能**：
- 用户注册、登录、JWT 认证
- 权限管理（用户/管理员）
- 用户信息修改

**API 端点**：
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/users/me
PATCH  /api/users/me
```

---

### 2. Link Module（链接模块 - 包含 QR 码）
**功能**：
- 创建/编辑/删除短链接
- 短链接重定向（核心功能）
- QR 码生成（前端渲染）

**API 端点**：
```
GET    /api/links          # 获取用户的所有链接
POST   /api/links          # 创建新链接
GET    /api/links/:id      # 获取链接详情
PATCH  /api/links/:id      # 更新链接
DELETE /api/links/:id      # 删除链接
GET    /:short_code        # 重定向（核心）
```

**重定向流程**：
```
1. 接收请求：GET /:short_code
2. 查询 Redis 缓存
   ├─ 缓存命中 → 直接返回 302 重定向
   └─ 缓存未命中 → 查询数据库 → 写入 Redis → 返回 302
3. 异步记录点击日志（不阻塞响应）
```

---

### 3. Analytics Module（数据分析模块）
**功能**：
- 点击日志记录
- 实时统计查询
- 数据聚合（按天/周/月）

**API 端点**：
```
GET    /api/links/:id/analytics      # 获取链接统计数据
GET    /api/links/:id/clicks         # 获取点击日志
GET    /api/links/:id/geo            # 地域分布
GET    /api/links/:id/devices        # 设备类型分布
```

---

### 4. LandingPage Module（落地页模块）
**功能**：
- 创建/编辑/发布落地页
- 落地页渲染
- 模板管理

**API 端点**：
```
GET    /api/links/:id/landing        # 获取落地页
POST   /api/links/:id/landing        # 创建落地页
PATCH  /api/links/:id/landing        # 更新落地页
DELETE /api/links/:id/landing        # 删除落地页
GET    /l/:short_code                # 渲染落地页
```

---

### 5. Team Module（团队模块 - 包含 API Keys）
**功能**：
- 团队创建、成员管理
- 角色权限控制
- API 密钥管理
- 批量导入/导出

**API 端点**：
```
# 团队管理
GET    /api/teams                    # 获取用户的团队
POST   /api/teams                    # 创建团队
GET    /api/teams/:id/members        # 获取团队成员
POST   /api/teams/:id/members        # 邀请成员

# API 密钥管理
GET    /api/api-keys                 # 获取 API 密钥列表
POST   /api/api-keys                 # 创建新密钥
DELETE /api/api-keys/:id             # 撤销密钥

# 批量操作
POST   /api/batch/import             # 批量导入链接
GET    /api/batch/export             # 批量导出链接
```

---

## 📈 性能基准测试目标

基于你的 **shortlinker 项目经验**（72w 并发，99.99% 可用性），对于这个重写版本，我们设定以下目标：

| 指标 | 目标值 | 测试工具 |
|------|--------|---------|
| **重定向响应时间** | < 100ms (p95) | Apache Bench / wrk |
| **并发处理能力** | 5,000 req/s | wrk / k6 |
| **系统可用性** | 99.5% | Uptime monitoring |
| **数据库查询时间** | < 50ms (p95) | PostgreSQL EXPLAIN ANALYZE |

**压力测试脚本示例**：
```bash
# 使用 wrk 进行重定向性能测试
wrk -t12 -c400 -d30s http://localhost:3000/abc123

# 预期结果：
# Requests/sec: 5000+
# Latency (p95): < 100ms
```

---

## 🚀 开发路线图

### Phase 1: MVP（最小可行产品）
- [ ] 用户注册、登录（JWT 认证）
- [ ] 创建/管理短链接
- [ ] 短链接重定向（Redis 缓存）
- [ ] 基础点击统计

### Phase 2: 数据分析
- [ ] 详细点击日志
- [ ] 地域/设备/浏览器分析
- [ ] 数据可视化（Chart.js）

### Phase 3: 高级功能
- [ ] QR 码生成
- [ ] 落地页编辑器
- [ ] 批量导入/导出
- [ ] API 密钥管理

### Phase 4: 团队协作
- [ ] 团队管理
- [ ] 成员权限控制
- [ ] 团队数据隔离

---

## 📚 参考资料

- **Redis 缓存策略**：https://redis.io/docs/manual/patterns/
- **Bloom Filter 原理**：https://en.wikipedia.org/wiki/Bloom_filter
- **JWT 最佳实践**：https://jwt.io/introduction
- **Argon2 密码散列**：https://github.com/P-H-C/phc-winner-argon2
- **GDPR IP 匿名化**：https://ico.org.uk/for-organisations/guide-to-data-protection/
- **TailwindCSS 文档**：https://tailwindcss.com/docs
- **Prisma ORM 文档**：https://www.prisma.io/docs

---

**文档维护者**：AptS:1548
**最后更新**：2025-10-21

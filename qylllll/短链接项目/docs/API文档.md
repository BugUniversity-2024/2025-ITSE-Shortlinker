# 短链接系统 API 文档

## 项目概述

短链接系统是一个用于将长URL转换为短URL的服务，提供链接生成、重定向、管理和统计功能。

### 版本信息
- API版本：v1.0.0
- 文档版本：1.0
- 最后更新：2025年9月19日

### 基础信息
- 基础URL：`https://api.shortlink.com/v1`
- 协议：HTTPS
- 数据格式：JSON
- 字符编码：UTF-8

## 认证机制

### API Key 认证
所有API请求都需要在请求头中包含API密钥：

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### 获取API Key
1. 注册账户：`POST /auth/register`
2. 用户登录：`POST /auth/login`
3. 获取API Key：`GET /auth/api-key`

## 通用响应格式

### 成功响应格式
```json
{
  "success": true,
  "data": {
    // 具体响应数据
  },
  "message": "操作成功",
  "timestamp": "2025-09-19T10:30:00Z"
}
```

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  },
  "timestamp": "2025-09-19T10:30:00Z"
}
```

## 错误代码表

| 错误代码 | HTTP状态码 | 描述 |
|---------|------------|------|
| `INVALID_URL` | 400 | 无效的URL格式 |
| `URL_TOO_LONG` | 400 | URL长度超过限制 |
| `SHORT_CODE_EXISTS` | 409 | 自定义短码已存在 |
| `SHORT_CODE_NOT_FOUND` | 404 | 短链接不存在 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 权限不足 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

## 接口限制

- 请求频率限制：每分钟100次
- URL最大长度：2048字符
- 自定义短码长度：4-20字符
- 自定义短码格式：仅支持字母、数字、连字符和下划线

---

# API 接口详情

## 1. 短链接生成

### 创建短链接
生成一个新的短链接，将长URL转换为短URL。

**接口地址：** `POST /links/create`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `url` | string | 是 | 原始长URL，必须是有效的HTTP/HTTPS链接 |
| `custom_code` | string | 否 | 自定义短码，4-20字符，仅支持字母、数字、连字符和下划线 |
| `expires_at` | string | 否 | 过期时间，ISO 8601格式，如：2025-12-31T23:59:59Z |
| `description` | string | 否 | 链接描述，最大长度200字符 |
| `tags` | array | 否 | 标签数组，用于分类管理 |

**请求示例：**
```json
{
  "url": "https://www.example.com/very/long/url/with/many/parameters?param1=value1&param2=value2",
  "custom_code": "my-link",
  "expires_at": "2025-12-31T23:59:59Z",
  "description": "示例网站链接",
  "tags": ["example", "demo"]
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "short_url": "https://short.ly/my-link",
    "short_code": "my-link",
    "original_url": "https://www.example.com/very/long/url/with/many/parameters?param1=value1&param2=value2",
    "qr_code": "https://api.shortlink.com/v1/qr/my-link",
    "created_at": "2025-09-19T10:30:00Z",
    "expires_at": "2025-12-31T23:59:59Z",
    "click_count": 0,
    "status": "active",
    "description": "示例网站链接",
    "tags": ["example", "demo"]
  },
  "message": "短链接创建成功",
  "timestamp": "2025-09-19T10:30:00Z"
}
```

**错误响应示例：**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "URL格式无效",
    "details": "提供的URL不符合HTTP/HTTPS格式要求"
  },
  "timestamp": "2025-09-19T10:30:00Z"
}
```

### 批量创建短链接
一次性创建多个短链接。

**接口地址：** `POST /links/batch`

**请求参数：**
```json
{
  "urls": [
    {
      "url": "https://example1.com",
      "custom_code": "link1",
      "description": "第一个链接"
    },
    {
      "url": "https://example2.com",
      "description": "第二个链接"
    }
  ]
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "id": "12345",
        "short_url": "https://short.ly/link1",
        "original_url": "https://example1.com"
      },
      {
        "id": "12346",
        "short_url": "https://short.ly/abc123",
        "original_url": "https://example2.com"
      }
    ],
    "failed": [],
    "total": 2,
    "success_count": 2,
    "failed_count": 0
  },
  "message": "批量创建完成",
  "timestamp": "2025-09-19T10:30:00Z"
}
```

---

## 2. 链接重定向与访问

### 短链接重定向
通过短链接跳转到原始链接，这是短链接的核心功能。

**接口地址：** `GET /{short_code}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `short_code` | string | 是 | 短链接代码（URL路径参数） |

**请求示例：**
```
GET /abc123
```

**成功响应：**
- HTTP状态码：302 Found
- Location头：原始URL
- 自动重定向到原始链接

**响应头示例：**
```http
HTTP/1.1 302 Found
Location: https://www.example.com/original/url
Cache-Control: no-cache
X-Short-Link-ID: 12345
X-Click-Count: 15
```

**错误响应（链接不存在）：**
```json
{
  "success": false,
  "error": {
    "code": "SHORT_CODE_NOT_FOUND",
    "message": "短链接不存在",
    "details": "未找到对应的短链接代码"
  },
  "timestamp": "2025-09-19T10:30:00Z"
}
```

**错误响应（链接已过期）：**
```json
{
  "success": false,
  "error": {
    "code": "LINK_EXPIRED",
    "message": "链接已过期",
    "details": "该短链接已超过有效期"
  },
  "timestamp": "2025-09-19T10:30:00Z"
}
```

### 获取链接信息（不重定向）
获取短链接的详细信息，不进行重定向。

**接口地址：** `GET /links/info/{short_code}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `short_code` | string | 是 | 短链接代码（URL路径参数） |

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "short_url": "https://short.ly/abc123",
    "short_code": "abc123",
    "original_url": "https://www.example.com/original/url",
    "qr_code": "https://api.shortlink.com/v1/qr/abc123",
    "created_at": "2025-09-19T10:30:00Z",
    "expires_at": "2025-12-31T23:59:59Z",
    "click_count": 15,
    "status": "active",
    "description": "示例网站链接",
    "tags": ["example", "demo"],
    "creator": "user123",
    "last_clicked": "2025-09-19T15:45:30Z"
  },
  "message": "获取链接信息成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

### 生成二维码
为短链接生成二维码图片。

**接口地址：** `GET /qr/{short_code}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `short_code` | string | 是 | 短链接代码（URL路径参数） |
| `size` | integer | 否 | 二维码尺寸，默认200，范围100-500 |
| `format` | string | 否 | 图片格式，支持png/jpg/svg，默认png |

**请求示例：**
```
GET /qr/abc123?size=300&format=png
```

**成功响应：**
- Content-Type: image/png (或对应格式)
- 返回二维码图片数据

---

## 3. 链接管理

### 获取用户链接列表
获取当前用户创建的所有短链接列表，支持分页和筛选。

**接口地址：** `GET /links`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `page` | integer | 否 | 页码，默认1 |
| `limit` | integer | 否 | 每页数量，默认20，最大100 |
| `status` | string | 否 | 状态筛选：active, expired, disabled |
| `tag` | string | 否 | 标签筛选 |
| `search` | string | 否 | 搜索关键词（匹配URL或描述） |
| `sort` | string | 否 | 排序方式：created_desc, created_asc, clicks_desc, clicks_asc |

**请求示例：**
```
GET /links?page=1&limit=10&status=active&sort=clicks_desc
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "links": [
      {
        "id": "12345",
        "short_url": "https://short.ly/abc123",
        "short_code": "abc123",
        "original_url": "https://www.example.com/page1",
        "created_at": "2025-09-19T10:30:00Z",
        "expires_at": "2025-12-31T23:59:59Z",
        "click_count": 25,
        "status": "active",
        "description": "示例页面1",
        "tags": ["example"]
      },
      {
        "id": "12346",
        "short_url": "https://short.ly/xyz789",
        "short_code": "xyz789",
        "original_url": "https://www.example.com/page2",
        "created_at": "2025-09-19T11:00:00Z",
        "click_count": 10,
        "status": "active",
        "description": "示例页面2",
        "tags": ["example", "test"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  },
  "message": "获取链接列表成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

### 更新短链接
修改现有短链接的信息。

**接口地址：** `PUT /links/{link_id}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `link_id` | string | 是 | 链接ID（URL路径参数） |
| `original_url` | string | 否 | 新的原始URL |
| `description` | string | 否 | 新的描述 |
| `tags` | array | 否 | 新的标签数组 |
| `expires_at` | string | 否 | 新的过期时间 |
| `status` | string | 否 | 状态：active, disabled |

**请求示例：**
```json
{
  "description": "更新后的描述",
  "tags": ["updated", "example"],
  "expires_at": "2026-01-31T23:59:59Z"
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "short_url": "https://short.ly/abc123",
    "short_code": "abc123",
    "original_url": "https://www.example.com/page1",
    "description": "更新后的描述",
    "tags": ["updated", "example"],
    "expires_at": "2026-01-31T23:59:59Z",
    "status": "active",
    "updated_at": "2025-09-19T16:00:00Z"
  },
  "message": "链接更新成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

### 删除短链接
删除指定的短链接。

**接口地址：** `DELETE /links/{link_id}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `link_id` | string | 是 | 链接ID（URL路径参数） |

**成功响应：**
```json
{
  "success": true,
  "data": {
    "deleted_id": "12345",
    "deleted_at": "2025-09-19T16:00:00Z"
  },
  "message": "链接删除成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

### 启用/禁用短链接
切换短链接的启用状态。

**接口地址：** `PATCH /links/{link_id}/status`

**请求参数：**
```json
{
  "status": "disabled"  // 或 "active"
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "status": "disabled",
    "updated_at": "2025-09-19T16:00:00Z"
  },
  "message": "链接状态更新成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

---

## 4. 数据统计与分析

### 获取链接点击统计
获取特定短链接的详细访问统计信息。

**接口地址：** `GET /analytics/links/{link_id}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `link_id` | string | 是 | 链接ID（URL路径参数） |
| `period` | string | 否 | 统计周期：day, week, month, year，默认week |
| `start_date` | string | 否 | 开始日期，格式：YYYY-MM-DD |
| `end_date` | string | 否 | 结束日期，格式：YYYY-MM-DD |

**请求示例：**
```
GET /analytics/links/12345?period=week&start_date=2025-09-01&end_date=2025-09-19
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "link_info": {
      "id": "12345",
      "short_code": "abc123",
      "original_url": "https://www.example.com/page1"
    },
    "summary": {
      "total_clicks": 125,
      "unique_clicks": 98,
      "period_clicks": 45,
      "click_rate": 12.5,
      "peak_hour": "14:00",
      "peak_day": "2025-09-15"
    },
    "time_series": [
      {
        "date": "2025-09-13",
        "clicks": 15,
        "unique_clicks": 12
      },
      {
        "date": "2025-09-14",
        "clicks": 8,
        "unique_clicks": 7
      },
      {
        "date": "2025-09-15",
        "clicks": 22,
        "unique_clicks": 18
      }
    ],
    "geographic": [
      {
        "country": "中国",
        "clicks": 85,
        "percentage": 68.0
      },
      {
        "country": "美国",
        "clicks": 25,
        "percentage": 20.0
      },
      {
        "country": "其他",
        "clicks": 15,
        "percentage": 12.0
      }
    ],
    "devices": [
      {
        "type": "mobile",
        "clicks": 75,
        "percentage": 60.0
      },
      {
        "type": "desktop",
        "clicks": 40,
        "percentage": 32.0
      },
      {
        "type": "tablet",
        "clicks": 10,
        "percentage": 8.0
      }
    ],
    "referrers": [
      {
        "source": "direct",
        "clicks": 50,
        "percentage": 40.0
      },
      {
        "source": "google.com",
        "clicks": 30,
        "percentage": 24.0
      },
      {
        "source": "facebook.com",
        "clicks": 25,
        "percentage": 20.0
      },
      {
        "source": "其他",
        "clicks": 20,
        "percentage": 16.0
      }
    ]
  },
  "message": "获取统计数据成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

### 获取用户总体统计
获取当前用户所有短链接的汇总统计信息。

**接口地址：** `GET /analytics/dashboard`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `period` | string | 否 | 统计周期：day, week, month, year，默认month |

**成功响应：**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_links": 48,
      "active_links": 42,
      "total_clicks": 1250,
      "unique_clicks": 987,
      "average_click_rate": 26.04,
      "top_performing_link": "abc123"
    },
    "recent_activity": [
      {
        "date": "2025-09-19",
        "links_created": 3,
        "total_clicks": 45
      },
      {
        "date": "2025-09-18",
        "links_created": 1,
        "total_clicks": 52
      }
    ],
    "top_links": [
      {
        "id": "12345",
        "short_code": "abc123",
        "clicks": 125,
        "original_url": "https://www.example.com/page1"
      },
      {
        "id": "12346",
        "short_code": "xyz789",
        "clicks": 98,
        "original_url": "https://www.example.com/page2"
      }
    ]
  },
  "message": "获取仪表板数据成功",
  "timestamp": "2025-09-19T16:00:00Z"
}
```

### 导出统计数据
导出指定链接的统计数据为CSV或Excel格式。

**接口地址：** `GET /analytics/export/{link_id}`

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `link_id` | string | 是 | 链接ID（URL路径参数） |
| `format` | string | 否 | 导出格式：csv, xlsx，默认csv |
| `start_date` | string | 否 | 开始日期 |
| `end_date` | string | 否 | 结束日期 |

**成功响应：**
- Content-Type: text/csv 或 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename="link_analytics_abc123.csv"
- 返回文件数据

---

## 5. 数据模型与数据库设计

### 核心数据表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    plan_type ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL
);
```

#### 短链接表 (short_links)
```sql
CREATE TABLE short_links (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    title VARCHAR(200) NULL,
    description TEXT NULL,
    custom_domain VARCHAR(100) NULL,
    password_hash VARCHAR(255) NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'disabled', 'expired') DEFAULT 'active',
    click_count INT DEFAULT 0,
    unique_click_count INT DEFAULT 0,
    last_clicked_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_short_code (short_code),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

#### 标签表 (tags)
```sql
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tag (user_id, name)
);
```

#### 链接标签关联表 (link_tags)
```sql
CREATE TABLE link_tags (
    link_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    
    PRIMARY KEY (link_id, tag_id),
    FOREIGN KEY (link_id) REFERENCES short_links(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### 点击记录表 (click_logs)
```sql
CREATE TABLE click_logs (
    id VARCHAR(36) PRIMARY KEY,
    link_id VARCHAR(36) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    referer TEXT NULL,
    country VARCHAR(3) NULL,
    city VARCHAR(100) NULL,
    device_type ENUM('desktop', 'mobile', 'tablet', 'other') NULL,
    browser VARCHAR(50) NULL,
    os VARCHAR(50) NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (link_id) REFERENCES short_links(id) ON DELETE CASCADE,
    INDEX idx_link_id (link_id),
    INDEX idx_clicked_at (clicked_at),
    INDEX idx_country (country)
);
```

### 数据模型说明

#### Link 对象模型
```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "short_code": "string (4-20字符)",
  "short_url": "string (完整短链接URL)",
  "original_url": "string (原始长URL)",
  "title": "string (可选标题)",
  "description": "string (可选描述)",
  "custom_domain": "string (可选自定义域名)",
  "password_protected": "boolean (是否有密码保护)",
  "tags": ["string"] (标签数组),
  "expires_at": "ISO 8601 timestamp (可选过期时间)",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "status": "active|disabled|expired",
  "click_count": "integer (总点击数)",
  "unique_click_count": "integer (独立访客数)",
  "last_clicked_at": "ISO 8601 timestamp (最后点击时间)",
  "qr_code_url": "string (二维码URL)"
}
```

#### User 对象模型
```json
{
  "id": "string (UUID)",
  "username": "string",
  "email": "string",
  "plan_type": "free|pro|enterprise",
  "api_key": "string (API密钥)",
  "created_at": "ISO 8601 timestamp",
  "is_active": "boolean",
  "last_login": "ISO 8601 timestamp",
  "limits": {
    "max_links": "integer (链接数量限制)",
    "max_clicks_per_month": "integer (月点击量限制)",
    "custom_domain": "boolean (是否支持自定义域名)",
    "password_protection": "boolean (是否支持密码保护)",
    "analytics_retention": "integer (统计数据保留天数)"
  }
}
```

#### ClickLog 对象模型
```json
{
  "id": "string (UUID)",
  "link_id": "string (UUID)",
  "ip_address": "string (已脱敏)",
  "user_agent": "string",
  "referer": "string",
  "location": {
    "country": "string (国家代码)",
    "city": "string"
  },
  "device": {
    "type": "desktop|mobile|tablet|other",
    "browser": "string",
    "os": "string"
  },
  "clicked_at": "ISO 8601 timestamp"
}
```

### 索引策略

1. **主要查询索引**
   - `short_links.short_code` - 快速重定向查询
   - `short_links.user_id` - 用户链接列表查询
   - `click_logs.link_id` - 统计数据查询

2. **复合索引**
   - `(user_id, status, created_at)` - 用户活跃链接查询
   - `(link_id, clicked_at)` - 时间序列统计查询

3. **性能优化**
   - 使用分区表存储点击记录（按月分区）
   - 实施数据归档策略（超过1年的详细点击记录）
   - 使用缓存层优化热门链接查询

---

## 6. 使用示例

### SDK 示例 (JavaScript)

```javascript
const ShortLinkAPI = require('shortlink-api-sdk');

const client = new ShortLinkAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.shortlink.com/v1'
});

// 创建短链接
const link = await client.createLink({
  url: 'https://www.example.com/very/long/url',
  custom_code: 'my-link',
  description: '我的示例链接'
});

console.log('短链接:', link.short_url);

// 获取统计数据
const analytics = await client.getAnalytics(link.id, {
  period: 'week'
});

console.log('点击次数:', analytics.summary.total_clicks);
```

### cURL 示例

```bash
# 创建短链接
curl -X POST https://api.shortlink.com/v1/links/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com/long/url",
    "custom_code": "my-link",
    "description": "示例链接"
  }'

# 获取链接信息
curl -X GET https://api.shortlink.com/v1/links/info/my-link \
  -H "Authorization: Bearer YOUR_API_KEY"

# 获取统计数据
curl -X GET "https://api.shortlink.com/v1/analytics/links/12345?period=week" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 附录

### 状态码说明
- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `302 Found` - 重定向（短链接跳转）
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未授权
- `403 Forbidden` - 权限不足
- `404 Not Found` - 资源不存在
- `409 Conflict` - 资源冲突
- `429 Too Many Requests` - 请求过于频繁
- `500 Internal Server Error` - 服务器内部错误

### 常见问题

**Q: 短链接的有效期是多久？**
A: 默认情况下短链接永久有效，除非用户设置了过期时间或手动禁用。

**Q: 可以修改已创建的短链接的目标URL吗？**
A: 可以，使用PUT /links/{link_id}接口可以修改目标URL和其他属性。

**Q: 如何防止恶意URL？**
A: 系统会检查URL的安全性，并提供黑名单功能来阻止恶意域名。

**Q: 支持自定义域名吗？**
A: Pro和Enterprise计划支持自定义域名功能。

**Q: 统计数据的保留期限是多久？**
A: 详细点击记录保留1年，汇总统计数据永久保留。
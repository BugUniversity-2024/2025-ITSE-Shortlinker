# Picture 3-9: Link Module Sequence Diagram
# 图 3-9:链接模块序列图

```mermaid
sequenceDiagram
    participant Client as 客户端<br>Client
    participant Controller as 控制器<br>LinkController
    participant Service as 服务层<br>LinkService
    participant Repository as 仓储层<br>LinkRepository
    participant Bloom as Bloom Filter<br>冲突检测
    participant Redis as Redis<br>缓存
    participant DB as PostgreSQL<br>数据库

    Note over Client,DB: 创建短链接流程 Create Short Link Flow

    Client->>Controller: POST /api/links<br>{original_url, custom_code?}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证 URL 格式<br>Validate URL

    Controller->>Service: createLink(user_id, data)

    alt 自定义短码 Custom Code
        Service->>Service: 验证短码格式<br>Validate Code Format
        Service->>Bloom: 检查短码是否存在<br>Check Code Exists
        Bloom-->>Service: false (不存在)

        Service->>Repository: findByShortCode(custom_code)
        Repository->>DB: SELECT * FROM short_links<br>WHERE short_code = ?
        DB-->>Repository: null
        Repository-->>Service: null

        Service->>Service: 使用自定义短码<br>Use Custom Code
    else 随机生成 Random Code
        Service->>Service: 生成随机 ID<br>Generate Random ID
        Service->>Service: Base62 编码<br>Base62 Encode

        loop 冲突检测 Collision Detection
            Service->>Bloom: 检查短码<br>Check Code
            Bloom-->>Service: exists?
            alt 存在 Exists
                Service->>Service: 重新生成<br>Regenerate
            else 不存在 Not Exists
                Service->>Service: 使用该短码<br>Use This Code
            end
        end
    end

    Service->>Repository: create({user_id, original_url, short_code})
    Repository->>DB: INSERT INTO short_links<br>(user_id, original_url, short_code,<br>created_at, is_active: true)
    DB-->>Repository: Link ID: 67890
    Repository-->>Service: Link Object

    Service->>Bloom: 添加短码<br>Add Code to Bloom
    Bloom-->>Service: OK

    Service->>Redis: SET link:{short_code}<br>original_url<br>TTL: 24h
    Redis-->>Service: OK

    Service-->>Controller: {short_url, original_url, short_code}
    Controller-->>Client: 201 Created<br>{link: {...}}

    Note over Client,DB: 重定向流程 Redirect Flow

    Client->>Controller: GET /:short_code
    Controller->>Service: redirect(short_code)

    Service->>Redis: GET link:{short_code}
    alt 缓存命中 Cache Hit
        Redis-->>Service: original_url
        Service->>Service: 异步记录点击<br>Async Log Click
    else 缓存未命中 Cache Miss
        Service->>Repository: findByShortCode(short_code)
        Repository->>DB: SELECT * FROM short_links<br>WHERE short_code = ?<br>AND is_active = true
        DB-->>Repository: Link Object
        Repository-->>Service: Link Object

        Service->>Redis: SET link:{short_code}<br>original_url<br>TTL: 24h
        Redis-->>Service: OK

        Service->>Service: 异步记录点击<br>Async Log Click
        Service-->>Controller: original_url
    end

    Service-->>Controller: original_url
    Controller-->>Client: 302 Redirect<br>Location: {original_url}

    par 异步记录点击日志 Async Click Logging
        Service->>Service: 提取访问信息<br>Extract Click Data
        Service->>Service: IP 哈希<br>Hash IP (SHA256)
        Service->>Service: 解析 User-Agent<br>Parse UA
        Service->>Service: GeoIP 定位<br>GeoIP Lookup
        Service->>Repository: createClickLog(click_data)
        Repository->>DB: INSERT INTO click_logs<br>(link_id, clicked_at, ip_hash,<br>country, city, device_type...)
        DB-->>Repository: OK
        Service->>Repository: incrementClickCount(link_id)
        Repository->>DB: UPDATE short_links<br>SET click_count = click_count + 1<br>WHERE id = ?
        DB-->>Repository: OK
    end

    Note over Client,DB: 获取用户链接列表 Get User Links

    Client->>Controller: GET /api/links?page=1&limit=10
    Controller->>Controller: 验证 JWT<br>Verify JWT

    Controller->>Service: getUserLinks(user_id, pagination)

    Service->>Redis: GET links:user:{user_id}:page:1
    alt 缓存命中 Cache Hit
        Redis-->>Service: Cached Links
        Service-->>Controller: Links Array
    else 缓存未命中 Cache Miss
        Service->>Repository: findByUserId(user_id, pagination)
        Repository->>DB: SELECT * FROM short_links<br>WHERE user_id = ?<br>ORDER BY created_at DESC<br>LIMIT 10 OFFSET 0
        DB-->>Repository: Links Array
        Repository-->>Service: Links Array

        Service->>Redis: SET links:user:{user_id}:page:1<br>links_array<br>TTL: 5min
        Redis-->>Service: OK

        Service-->>Controller: Links Array
    end

    Controller-->>Client: 200 OK<br>{links: [...], total: 123}

    Note over Client,DB: 更新短链接 Update Link

    Client->>Controller: PATCH /api/links/:link_id<br>{original_url, is_active}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Ownership

    Controller->>Service: updateLink(link_id, user_id, data)

    Service->>Repository: findById(link_id)
    Repository->>DB: SELECT * FROM short_links<br>WHERE id = ? AND user_id = ?
    DB-->>Repository: Link Object
    Repository-->>Service: Link Object

    alt 链接不存在或无权限 Not Found or Unauthorized
        Service-->>Controller: Error: Not Found
        Controller-->>Client: 404 Not Found
    else 更新成功 Update Success
        Service->>Repository: update(link_id, data)
        Repository->>DB: UPDATE short_links<br>SET original_url = ?, is_active = ?<br>WHERE id = ?
        DB-->>Repository: Updated Link
        Repository-->>Service: Link Object

        Service->>Redis: SET link:{short_code}<br>new_original_url<br>TTL: 24h
        Service->>Redis: DEL links:user:{user_id}:*
        Redis-->>Service: OK

        Service-->>Controller: Updated Link
        Controller-->>Client: 200 OK<br>{link: {...}}
    end

    Note over Client,DB: 删除短链接 Delete Link

    Client->>Controller: DELETE /api/links/:link_id
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Ownership

    Controller->>Service: deleteLink(link_id, user_id)

    Service->>Repository: findById(link_id)
    Repository->>DB: SELECT * FROM short_links<br>WHERE id = ? AND user_id = ?
    DB-->>Repository: Link Object
    Repository-->>Service: Link Object

    alt 软删除 Soft Delete
        Service->>Repository: update(link_id, {is_active: false})
        Repository->>DB: UPDATE short_links<br>SET is_active = false<br>WHERE id = ?
        DB-->>Repository: OK
    else 硬删除 Hard Delete (可选)
        Service->>Repository: delete(link_id)
        Repository->>DB: DELETE FROM short_links<br>WHERE id = ?
        DB-->>Repository: OK
    end

    Service->>Redis: DEL link:{short_code}
    Service->>Redis: DEL links:user:{user_id}:*
    Redis-->>Service: OK

    Service-->>Controller: {success: true}
    Controller-->>Client: 204 No Content

    style Client fill:#E3F2FD
    style Controller fill:#C8E6C9
    style Service fill:#FFF9C4
    style Repository fill:#FFE0B2
    style Bloom fill:#E1BEE7
    style Redis fill:#FFCCBC
    style DB fill:#F8BBD0
```

## 模块说明

### 🔗 链接模块核心功能

链接模块是 TinyBridge 的核心,负责短链接的创建、存储、重定向和管理。

---

### 1️⃣ 创建短链接详解

#### Base62 编码算法

```typescript
const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function base62Encode(num: number): string {
  if (num === 0) return '0'

  let encoded = ''
  while (num > 0) {
    const remainder = num % 62
    encoded = BASE62_CHARSET[remainder] + encoded
    num = Math.floor(num / 62)
  }
  return encoded
}

function generateShortCode(): string {
  // 使用当前时间戳 + 随机数生成唯一 ID
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000000)
  const uniqueId = timestamp * 1000000 + random

  // Base62 编码
  return base62Encode(uniqueId)
}

// 示例输出
generateShortCode()  // "aB3xY9" (6-8 字符)
```

#### Bloom Filter 冲突检测

```typescript
import { BloomFilter } from 'bloom-filters'

// 初始化 Bloom Filter
const bloomFilter = new BloomFilter({
  size: 10000000,           // 1000 万个元素
  falsePositiveRate: 0.01   // 1% 误判率
})

async function checkShortCodeExists(code: string): Promise<boolean> {
  // 1. Bloom Filter 快速检测 (O(1))
  if (!bloomFilter.has(code)) {
    return false  // 100% 不存在
  }

  // 2. 可能存在,查询数据库确认
  const link = await linkRepository.findByShortCode(code)
  return !!link
}

async function createLink(userId: number, originalUrl: string, customCode?: string) {
  let shortCode: string

  if (customCode) {
    // 验证自定义短码格式
    if (!/^[a-zA-Z0-9]{4,12}$/.test(customCode)) {
      throw new Error('自定义短码格式错误 (4-12 字符,仅字母数字)')
    }

    // 检查是否已存在
    const exists = await checkShortCodeExists(customCode)
    if (exists) {
      throw new Error('该短码已被占用')
    }

    shortCode = customCode
  } else {
    // 随机生成短码,重试机制防止冲突
    let attempts = 0
    const MAX_ATTEMPTS = 5

    while (attempts < MAX_ATTEMPTS) {
      shortCode = generateShortCode()
      const exists = await checkShortCodeExists(shortCode)

      if (!exists) {
        break
      }

      attempts++
    }

    if (attempts === MAX_ATTEMPTS) {
      throw new Error('生成短码失败,请重试')
    }
  }

  // 创建链接
  const link = await linkRepository.create({
    user_id: userId,
    original_url: originalUrl,
    short_code: shortCode,
    created_at: new Date(),
    is_active: true,
    click_count: 0
  })

  // 添加到 Bloom Filter
  bloomFilter.add(shortCode)

  // 缓存到 Redis
  await redis.set(
    `link:${shortCode}`,
    originalUrl,
    'EX',
    24 * 3600  // 24 小时
  )

  return {
    short_url: `https://tinybridge.link/${shortCode}`,
    original_url: originalUrl,
    short_code: shortCode,
    created_at: link.created_at
  }
}
```

---

### 2️⃣ 重定向流程优化

#### 多层缓存策略

```typescript
async function redirect(shortCode: string, request: any) {
  // 1. 优先从 Redis 获取 (< 1ms)
  let originalUrl = await redis.get(`link:${shortCode}`)

  if (!originalUrl) {
    // 2. Redis 未命中,查询数据库
    const link = await linkRepository.findByShortCode(shortCode)

    if (!link || !link.is_active) {
      throw new Error('链接不存在或已失效')
    }

    originalUrl = link.original_url

    // 3. 写入 Redis 缓存
    await redis.set(
      `link:${shortCode}`,
      originalUrl,
      'EX',
      24 * 3600  // 24 小时
    )
  }

  // 4. 异步记录点击日志 (不阻塞重定向)
  logClickAsync(shortCode, request).catch(err => {
    console.error('Failed to log click:', err)
  })

  // 5. 立即返回重定向
  return originalUrl
}

// 异步点击日志
async function logClickAsync(shortCode: string, request: any) {
  const link = await linkRepository.findByShortCode(shortCode)

  // 提取访问信息
  const ip = request.headers['x-real-ip'] || request.ip
  const userAgent = request.headers['user-agent']
  const referrer = request.headers['referer'] || null

  // IP 隐私保护
  const dailySalt = getDailySalt()
  const ipHash = crypto
    .createHash('sha256')
    .update(ip + dailySalt)
    .digest('hex')

  // 解析 User-Agent
  const ua = UAParser(userAgent)
  const deviceType = ua.device.type || 'desktop'
  const browser = ua.browser.name || 'Unknown'
  const os = ua.os.name || 'Unknown'

  // GeoIP 地理定位
  const geo = geoip.lookup(ip)
  const country = geo?.country || 'Unknown'
  const city = geo?.city || 'Unknown'

  // 保存点击日志
  await linkRepository.createClickLog({
    link_id: link.id,
    clicked_at: new Date(),
    ip_hash: ipHash,
    user_agent: userAgent,
    referrer,
    country,
    city,
    device_type: deviceType,
    browser,
    os
  })

  // 增加点击计数 (冗余字段,用于快速查询)
  await linkRepository.incrementClickCount(link.id)
}
```

#### 性能指标

| 场景 | 响应时间 | 说明 |
|------|----------|------|
| **Redis 缓存命中** | < 10ms | 95% 的请求 |
| **Redis 缓存未命中** | < 100ms | 5% 的请求 (首次访问) |
| **并发处理能力** | 5,000 req/s | 单实例 |

---

### 3️⃣ 获取用户链接列表

```typescript
async function getUserLinks(
  userId: number,
  options: {
    page: number
    limit: number
    sortBy?: 'created_at' | 'click_count'
    order?: 'ASC' | 'DESC'
  }
) {
  const { page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = options
  const offset = (page - 1) * limit

  // 1. 尝试从 Redis 缓存获取
  const cacheKey = `links:user:${userId}:page:${page}:sort:${sortBy}:${order}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  // 2. 查询数据库
  const links = await linkRepository.findByUserId(userId, {
    limit,
    offset,
    sortBy,
    order
  })

  const total = await linkRepository.countByUserId(userId)

  const result = {
    links,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  }

  // 3. 缓存结果 (5 分钟)
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 300)

  return result
}
```

---

### 4️⃣ 更新短链接

```typescript
async function updateLink(
  linkId: number,
  userId: number,
  updateData: {
    original_url?: string
    is_active?: boolean
  }
) {
  // 1. 验证权限
  const link = await linkRepository.findById(linkId)

  if (!link || link.user_id !== userId) {
    throw new Error('链接不存在或无权限')
  }

  // 2. 验证 URL 格式 (如果更新 URL)
  if (updateData.original_url) {
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(updateData.original_url)) {
      throw new Error('无效的 URL 格式')
    }
  }

  // 3. 更新数据库
  const updatedLink = await linkRepository.update(linkId, updateData)

  // 4. 更新 Redis 缓存
  if (updateData.original_url) {
    await redis.set(
      `link:${link.short_code}`,
      updateData.original_url,
      'EX',
      24 * 3600
    )
  }

  // 5. 清除用户链接列表缓存
  const pattern = `links:user:${userId}:*`
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }

  return updatedLink
}
```

---

### 5️⃣ 删除短链接

```typescript
async function deleteLink(linkId: number, userId: number) {
  // 1. 验证权限
  const link = await linkRepository.findById(linkId)

  if (!link || link.user_id !== userId) {
    throw new Error('链接不存在或无权限')
  }

  // 2. 软删除 (推荐)
  await linkRepository.update(linkId, { is_active: false })

  // 或者硬删除 (根据需求)
  // await linkRepository.delete(linkId)

  // 3. 删除 Redis 缓存
  await redis.del(`link:${link.short_code}`)

  // 4. 清除用户链接列表缓存
  const pattern = `links:user:${userId}:*`
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }

  return { success: true }
}
```

---

### 🔒 安全措施

| 措施 | 实现方式 |
|------|----------|
| **权限验证** | 验证 JWT + 检查 user_id 所有权 |
| **URL 验证** | 正则表达式 + 协议白名单 (http/https) |
| **防滥用** | 用户每天最多创建 100 个短链接 |
| **短码格式** | 4-12 字符,仅字母数字,防止恶意短码 |
| **软删除** | 保留历史数据,支持恢复 |
| **IP 哈希** | SHA256 + 每日轮换 Salt |

---

### ⚡ 性能优化

| 策略 | 效果 |
|------|------|
| **Bloom Filter** | 减少 95% 的数据库查询 |
| **Redis 缓存** | 重定向响应时间 < 10ms |
| **异步日志** | 不阻塞重定向,保持高吞吐 |
| **数据库索引** | `short_code` 唯一索引 + `user_id` 索引 |
| **冗余字段** | `click_count` 字段避免频繁聚合查询 |

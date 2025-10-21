# Picture 3-8: Link Module Diagram
# 图 3-8:链接模块图

```mermaid
graph TB
    subgraph "链接模块 Link Module"
        subgraph "控制器层 Controller Layer"
            LinkController[链接控制器<br>LinkController]
            RedirectController[重定向控制器<br>RedirectController]
        end

        subgraph "服务层 Service Layer"
            LinkService[链接服务<br>LinkService]
            ShortCodeGenerator[短码生成器<br>ShortCodeGenerator]
            ClickLogger[点击日志记录<br>ClickLogger]
        end

        subgraph "仓储层 Repository Layer"
            LinkRepository[链接仓储<br>LinkRepository]
            ClickLogRepository[点击日志仓储<br>ClickLogRepository]
        end

        subgraph "工具组件 Utilities"
            Base62Encoder[Base62编码器<br>Base62 Encoder]
            BloomFilter[布隆过滤器<br>Bloom Filter]
            URLValidator[URL验证器<br>URL Validator]
        end
    end

    Client([客户端])
    Visitor([访客])
    Database[(数据库)]
    Redis[(Redis)]

    Client -->|POST /api/links| LinkController
    Client -->|GET /api/links| LinkController
    Client -->|PATCH /api/links/:id| LinkController
    Client -->|DELETE /api/links/:id| LinkController

    Visitor -->|GET /:short_code| RedirectController

    LinkController -->|创建/管理| LinkService
    RedirectController -->|重定向| LinkService
    RedirectController -->|记录日志| ClickLogger

    LinkService -->|生成短码| ShortCodeGenerator
    LinkService -->|验证URL| URLValidator
    LinkService -->|操作链接| LinkRepository

    ShortCodeGenerator -->|Base62编码| Base62Encoder
    ShortCodeGenerator -->|检查冲突| BloomFilter

    ClickLogger -->|保存日志| ClickLogRepository

    LinkRepository -->|读写| Database
    LinkRepository -->|缓存| Redis
    ClickLogRepository -->|写入| Database

    BloomFilter -.->|快速查询| Redis

    style LinkController fill:#3B82F6,color:#fff
    style RedirectController fill:#10B981,color:#fff
    style LinkService fill:#FFF9C4
    style ShortCodeGenerator fill:#FFCCBC
    style ClickLogger fill:#FFCCBC
    style LinkRepository fill:#FFE0B2
    style ClickLogRepository fill:#FFE0B2
    style Base62Encoder fill:#C8E6C9
    style BloomFilter fill:#EC4899
    style URLValidator fill:#C8E6C9
    style Database fill:#F8BBD0
    style Redis fill:#FFCCBC
```

## 核心流程

### 1. 创建短链接
```
用户请求 → LinkController
    ↓
LinkService.createLink()
    ↓
URLValidator.validate(url)
    ↓
ShortCodeGenerator.generate()
    ├→ Base62Encoder.encode(id)
    └→ BloomFilter.check(code)
    ↓
LinkRepository.create()
    ├→ Database.insert()
    └→ Redis.cache()
```

### 2. 访问短链接
```
访客请求 → RedirectController
    ↓
LinkService.redirect(code)
    ↓
Redis.get(code)
    ├→ 缓存命中 → 返回URL
    └→ 缓存未命中
            ↓
        Database.query()
            ↓
        Redis.set(code, url)
            ↓
        返回URL
    ↓
异步: ClickLogger.log()
    ↓
返回 302 重定向
```

## 关键组件

### ShortCodeGenerator (短码生成器)
```typescript
class ShortCodeGenerator {
  generate(customCode?: string): string {
    if (customCode) {
      if (!this.validate(customCode)) throw new Error('Invalid code')
      if (this.bloomFilter.has(customCode)) throw new Error('Code exists')
      return customCode
    }

    let code: string
    let attempts = 0

    do {
      code = this.base62Encoder.encode(Date.now() + Math.random())
      attempts++
      if (attempts > 5) throw new Error('Failed to generate unique code')
    } while (this.bloomFilter.has(code))

    return code
  }
}
```

### BloomFilter (布隆过滤器)
```typescript
class BloomFilter {
  has(code: string): boolean {
    // O(1) 快速检测
    return this.filter.has(code)
  }

  add(code: string): void {
    this.filter.add(code)
  }
}
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/links | 创建短链接 |
| GET | /api/links | 获取链接列表 |
| GET | /api/links/:id | 获取单个链接详情 |
| PATCH | /api/links/:id | 更新链接 |
| DELETE | /api/links/:id | 删除链接 |
| GET | /:short_code | 重定向到原始URL |

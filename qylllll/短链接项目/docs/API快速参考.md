# 短链接系统 API 快速参考

## 基础信息
- **基础URL**: `https://api.shortlink.com/v1`
- **认证方式**: Bearer Token (API Key)
- **数据格式**: JSON
- **请求头**: `Authorization: Bearer YOUR_API_KEY`

## 接口概览

### 🔗 短链接管理

| 方法 | 端点 | 描述 |
|------|------|------|
| `POST` | `/links/create` | 创建短链接 |
| `POST` | `/links/batch` | 批量创建短链接 |
| `GET` | `/links` | 获取用户链接列表 |
| `GET` | `/links/{link_id}` | 获取单个链接详情 |
| `PUT` | `/links/{link_id}` | 更新链接信息 |
| `DELETE` | `/links/{link_id}` | 删除链接 |
| `PATCH` | `/links/{link_id}/status` | 更新链接状态 |

### 🔄 重定向访问

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/{short_code}` | 短链接重定向 |
| `GET` | `/links/info/{short_code}` | 获取链接信息（不重定向） |
| `GET` | `/qr/{short_code}` | 生成二维码 |

### 📊 统计分析

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/analytics/links/{link_id}` | 获取链接统计 |
| `GET` | `/analytics/dashboard` | 获取用户仪表板 |
| `GET` | `/analytics/export/{link_id}` | 导出统计数据 |

### 👤 用户认证

| 方法 | 端点 | 描述 |
|------|------|------|
| `POST` | `/auth/register` | 用户注册 |
| `POST` | `/auth/login` | 用户登录 |
| `GET` | `/auth/api-key` | 获取API密钥 |
| `POST` | `/auth/refresh` | 刷新令牌 |

## 快速开始示例

### 1. 创建短链接
```bash
curl -X POST https://api.shortlink.com/v1/links/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com/very/long/url",
    "custom_code": "my-link",
    "description": "我的示例链接"
  }'
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "short_url": "https://short.ly/my-link",
    "short_code": "my-link",
    "original_url": "https://www.example.com/very/long/url",
    "qr_code": "https://api.shortlink.com/v1/qr/my-link",
    "created_at": "2025-09-19T10:30:00Z",
    "click_count": 0,
    "status": "active"
  }
}
```

### 2. 获取链接列表
```bash
curl -X GET "https://api.shortlink.com/v1/links?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. 访问短链接
```bash
curl -L https://short.ly/my-link
# 自动重定向到原始URL
```

### 4. 获取统计数据
```bash
curl -X GET "https://api.shortlink.com/v1/analytics/links/12345?period=week" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 常用参数说明

### 创建链接参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | ✅ | 原始长URL |
| `custom_code` | string | ❌ | 自定义短码 (4-20字符) |
| `expires_at` | string | ❌ | 过期时间 (ISO 8601格式) |
| `description` | string | ❌ | 链接描述 |
| `tags` | array | ❌ | 标签数组 |

### 查询参数
| 参数 | 说明 | 示例值 |
|------|------|---------|
| `page` | 页码 | `1` |
| `limit` | 每页数量 | `20` |
| `status` | 状态筛选 | `active`, `disabled`, `expired` |
| `sort` | 排序方式 | `created_desc`, `clicks_desc` |
| `search` | 搜索关键词 | `example` |

### 统计参数
| 参数 | 说明 | 示例值 |
|------|------|---------|
| `period` | 统计周期 | `day`, `week`, `month`, `year` |
| `start_date` | 开始日期 | `2025-09-01` |
| `end_date` | 结束日期 | `2025-09-19` |

## 响应状态码

| 状态码 | 说明 |
|--------|------|
| `200` | 请求成功 |
| `201` | 资源创建成功 |
| `302` | 重定向（短链接跳转） |
| `400` | 请求参数错误 |
| `401` | 未授权访问 |
| `403` | 权限不足 |
| `404` | 资源不存在 |
| `409` | 资源冲突（如短码已存在） |
| `429` | 请求频率超限 |
| `500` | 服务器内部错误 |

## 错误处理

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

### 常见错误代码
| 错误代码 | 描述 |
|----------|------|
| `INVALID_URL` | 无效的URL格式 |
| `SHORT_CODE_EXISTS` | 短码已存在 |
| `SHORT_CODE_NOT_FOUND` | 短链接不存在 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 |
| `QUOTA_EXCEEDED` | 配额超限 |

## SDK 支持

### JavaScript/Node.js
```javascript
const ShortLinkAPI = require('shortlink-api-sdk');

const client = new ShortLinkAPI({
  apiKey: 'your-api-key'
});

// 创建短链接
const link = await client.createLink({
  url: 'https://example.com',
  custom_code: 'my-link'
});
```

### Python
```python
from shortlink_sdk import ShortLinkClient

client = ShortLinkClient(api_key='your-api-key')

# 创建短链接
link = client.create_link(
    url='https://example.com',
    custom_code='my-link'
)
```

### PHP
```php
use ShortLink\Client;

$client = new Client('your-api-key');

// 创建短链接
$link = $client->createLink([
    'url' => 'https://example.com',
    'custom_code' => 'my-link'
]);
```

## 限制说明

### 免费计划限制
- 每月100个链接
- 每月1000次点击
- 基础统计数据
- 30天数据保留

### Pro计划限制
- 每月1000个链接
- 每月100,000次点击
- 详细统计分析
- 1年数据保留
- 自定义域名支持

### Enterprise计划
- 无限链接数量
- 无限点击次数
- 完整统计功能
- 永久数据保留
- 白标解决方案

## 最佳实践

1. **API密钥安全**
   - 不要在客户端代码中暴露API密钥
   - 定期轮换API密钥
   - 使用环境变量存储密钥

2. **错误处理**
   - 总是检查响应的`success`字段
   - 实现重试机制处理临时错误
   - 记录错误信息便于调试

3. **性能优化**
   - 使用分页获取大量数据
   - 实施客户端缓存
   - 避免频繁的API调用

4. **监控和告警**
   - 监控API调用频率
   - 设置配额使用告警
   - 跟踪错误率和响应时间

## 支持和帮助

- **技术文档**: https://docs.shortlink.com
- **SDK下载**: https://github.com/shortlink/sdk
- **问题反馈**: https://github.com/shortlink/api/issues
- **技术支持**: support@shortlink.com
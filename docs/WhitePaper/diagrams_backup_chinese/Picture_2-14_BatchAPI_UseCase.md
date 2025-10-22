# Picture 2-14: Use Case Diagram of Batch Operations via API
# 图 2-14:批量操作与 API 管理的用例图

```mermaid
graph TB
    User([用户<br>User])
    APIClient([API客户端<br>API Client])

    subgraph "API管理系统<br>API Management System"
        CreateAPIKey[创建API密钥<br>Create API Key]
        RevokeAPIKey[撤销API密钥<br>Revoke API Key]
        ViewAPIUsage[查看API使用情况<br>View API Usage]

        BatchImport[批量导入链接<br>Batch Import Links]
        BatchExport[批量导出数据<br>Batch Export Data]
        BatchUpdate[批量更新链接<br>Batch Update Links]
        BatchDelete[批量删除链接<br>Batch Delete Links]
    end

    APIGateway[API网关<br>API Gateway]
    RateLimiter[速率限制器<br>Rate Limiter]
    Database[(数据库<br>Database)]
    Redis[(Redis<br>缓存)]

    User -->|创建密钥| CreateAPIKey
    User -->|撤销密钥| RevokeAPIKey
    User -->|查看使用| ViewAPIUsage

    APIClient -->|批量导入| BatchImport
    APIClient -->|批量导出| BatchExport
    APIClient -->|批量更新| BatchUpdate
    APIClient -->|批量删除| BatchDelete

    CreateAPIKey -->|生成密钥| CreateAPIKey
    CreateAPIKey -->|SHA256哈希| Database

    RevokeAPIKey -->|使密钥失效| Redis
    RevokeAPIKey -->|更新状态| Database

    ViewAPIUsage -->|查询统计| Database
    ViewAPIUsage -->|读取计数| Redis

    BatchImport -->|验证密钥| APIGateway
    BatchExport -->|验证密钥| APIGateway
    BatchUpdate -->|验证密钥| APIGateway
    BatchDelete -->|验证密钥| APIGateway

    APIGateway -->|检查速率| RateLimiter
    RateLimiter -->|读写计数| Redis

    BatchImport -->|批量创建| Database
    BatchExport -->|批量查询| Database
    BatchUpdate -->|批量更新| Database
    BatchDelete -->|批量删除| Database

    style User fill:#10B981,color:#fff
    style APIClient fill:#8B5CF6,color:#fff
    style CreateAPIKey fill:#3B82F6,color:#fff
    style RevokeAPIKey fill:#EF4444,color:#fff
    style ViewAPIUsage fill:#F59E0B,color:#fff
    style BatchImport fill:#3B82F6,color:#fff
    style BatchExport fill:#3B82F6,color:#fff
    style BatchUpdate fill:#F59E0B,color:#fff
    style BatchDelete fill:#EF4444,color:#fff
    style APIGateway fill:#EC4899,color:#fff
    style RateLimiter fill:#EF4444,color:#fff
    style Database fill:#6366F1,color:#fff
    style Redis fill:#EF4444,color:#fff
```

## API 密钥管理

### 创建 API 密钥

**请求示例**:
```http
POST /api/api-keys
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "My Production API Key",
  "permissions": ["read", "write"],
  "rate_limit": 1000
}
```

**响应示例**:
```json
{
  "api_key": "tb_live_abc123def456ghi789",
  "name": "My Production API Key",
  "permissions": ["read", "write"],
  "rate_limit": 1000,
  "created_at": "2025-01-10T14:30:00Z",
  "expires_at": null
}
```

**注意**: API 密钥仅在创建时显示一次,请妥善保存!

---

## 批量操作 API

### 1. 批量导入链接

**请求示例**:
```http
POST /api/batch/links
Authorization: Bearer tb_live_abc123def456ghi789
Content-Type: application/json

{
  "links": [
    {
      "original_url": "https://example.com/page1",
      "custom_code": "page1"
    },
    {
      "original_url": "https://example.com/page2"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": 1,
  "failed": 1,
  "results": [
    {
      "original_url": "https://example.com/page1",
      "short_url": "https://tinybridge.link/page1",
      "status": "success"
    },
    {
      "original_url": "https://example.com/page2",
      "error": "Short code already exists",
      "status": "failed"
    }
  ]
}
```

---

### 2. 批量导出数据

**请求示例**:
```http
GET /api/batch/links/export?format=csv
Authorization: Bearer tb_live_abc123def456ghi789
```

**CSV 响应**:
```csv
short_code,original_url,click_count,created_at,is_active
abc123,https://example.com/page1,1247,2025-01-01T10:00:00Z,true
xyz789,https://example.com/page2,856,2025-01-02T11:30:00Z,true
```

**JSON 响应**:
```json
{
  "links": [
    {
      "short_code": "abc123",
      "original_url": "https://example.com/page1",
      "click_count": 1247,
      "created_at": "2025-01-01T10:00:00Z",
      "is_active": true
    }
  ],
  "total": 1
}
```

---

### 3. 速率限制

**限制规则**:
- 每个 API 密钥: **1,000 请求/小时**
- 使用滑动窗口算法 (Redis)

**超限响应**:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "limit": 1000,
  "remaining": 0,
  "reset_at": "2025-01-10T15:00:00Z"
}
```

---

## 使用场景

### 场景 1: 电商批量创建商品链接
```python
import requests

api_key = "tb_live_abc123def456ghi789"
headers = {"Authorization": f"Bearer {api_key}"}

products = [
    {"id": 1001, "url": "https://shop.com/product/1001"},
    {"id": 1002, "url": "https://shop.com/product/1002"},
    # ... 1000 products
]

links = [
    {
        "original_url": p["url"],
        "custom_code": f"prod{p['id']}"
    }
    for p in products
]

response = requests.post(
    "https://tinybridge.link/api/batch/links",
    headers=headers,
    json={"links": links}
)

print(f"成功创建 {response.json()['success']} 个链接")
```

---

### 场景 2: 定时导出分析数据
```bash
#!/bin/bash

API_KEY="tb_live_abc123def456ghi789"
DATE=$(date +%Y-%m-%d)

curl -H "Authorization: Bearer $API_KEY" \
  "https://tinybridge.link/api/batch/links/export?format=csv" \
  -o "links_backup_$DATE.csv"

echo "数据已导出到 links_backup_$DATE.csv"
```

---

## 安全措施

| 措施 | 说明 |
|------|------|
| **密钥哈希** | API 密钥使用 SHA256 哈希后存储 |
| **HTTPS** | 强制使用 HTTPS 传输 |
| **速率限制** | 防止滥用,保护系统资源 |
| **权限控制** | 只读/读写权限分离 |
| **即时撤销** | 撤销密钥后立即失效 |

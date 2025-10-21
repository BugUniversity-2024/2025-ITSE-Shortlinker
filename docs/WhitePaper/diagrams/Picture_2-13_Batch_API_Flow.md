# Picture 2-13: Business Process Models of Batch Operations via API
# 图 2-13：批量操作与 API 管理的业务流程模型图

```mermaid
flowchart TD
    Start([开始 Start]) --> APISettings[进入 API 设置页面<br>Enter API Settings Page]
    APISettings --> ViewKeys[查看现有 API Keys<br>View Existing API Keys]
    ViewKeys --> UserAction{用户操作<br>User Action}

    UserAction -->|创建新 Key<br>Create New Key| SelectPerm[选择权限<br>Select Permissions]
    UserAction -->|撤销 Key<br>Revoke Key| RevokeKey[撤销 API Key<br>Revoke API Key]
    UserAction -->|使用 API<br>Use API| PrepareCall

    SelectPerm --> SetReadOnly{权限设置<br>Permission Setting}
    SetReadOnly -->|只读 Read-Only| ReadPerm[设置 read: true<br>write: false]
    SetReadOnly -->|读写 Read-Write| WritePerm[设置 read: true<br>write: true]

    ReadPerm --> SetLimit[设置速率限制<br>Set Rate Limit<br>默认 1000/小时]
    WritePerm --> SetLimit

    SetLimit --> GenerateKey[生成随机 Key<br>Generate Random Key]
    GenerateKey --> HashKey[SHA256 哈希存储<br>Hash with SHA256]
    HashKey --> ShowOnce[仅显示一次<br>Display Only Once<br>⚠️ 请立即保存]
    ShowOnce --> KeyCreated[Key 创建成功<br>Key Created]
    KeyCreated --> End1([结束 End])

    RevokeKey --> InvalidateRedis[Redis 中失效<br>Invalidate in Redis]
    InvalidateRedis --> DeleteDB[数据库中删除<br>Delete from DB]
    DeleteDB --> RevokeSuccess[撤销成功<br>Revoke Success]
    RevokeSuccess --> End1

    PrepareCall([API 调用准备<br>Prepare API Call]) --> UploadFile{操作类型<br>Operation Type}
    UploadFile -->|批量导入<br>Batch Import| PrepareCSV[准备 CSV/JSON 文件<br>Prepare CSV/JSON File]
    UploadFile -->|批量导出<br>Batch Export| PrepareExport[准备导出请求<br>Prepare Export Request]

    PrepareCSV --> ParseFile[解析文件<br>Parse File<br>提取 URLs]
    ParseFile --> BuildRequest[构建 API 请求<br>Build API Request]

    PrepareExport --> BuildRequest

    BuildRequest --> AddAuth[添加 Authorization Header<br>Bearer API_KEY]
    AddAuth --> SendRequest[发送 POST/GET 请求<br>Send HTTP Request]
    SendRequest --> Gateway[API Gateway 接收<br>API Gateway Receives]

    Gateway --> ValidateKey{验证 API Key<br>Validate API Key}
    ValidateKey -->|无效 Invalid| Return401[返回 401 Unauthorized<br>Return 401 Error]
    ValidateKey -->|有效 Valid| CheckRate{检查速率限制<br>Check Rate Limit}

    CheckRate -->|超限 Exceeded| Return429[返回 429 Too Many Requests<br>Return 429 Error]
    CheckRate -->|正常 OK| ProcessBatch[处理批量操作<br>Process Batch Operation]

    ProcessBatch --> ImportFlow{导入/导出<br>Import/Export}
    ImportFlow -->|导入 Import| ValidateURLs[验证每个 URL<br>Validate Each URL]
    ImportFlow -->|导出 Export| QueryLinks[查询用户链接<br>Query User Links]

    ValidateURLs --> GenerateCodes[批量生成短码<br>Generate Short Codes]
    GenerateCodes --> SaveBatch[批量保存到 DB<br>Batch Save to DB]
    SaveBatch --> ReturnResult

    QueryLinks --> FormatData[格式化数据<br>Format Data<br>CSV/JSON]
    FormatData --> ReturnResult[返回操作结果<br>Return Result]

    ReturnResult --> IncrementCount[增加 API 调用计数<br>Increment API Call Count]
    IncrementCount --> UpdateRedis[更新 Redis 计数器<br>Update Redis Counter]
    UpdateRedis --> End2([结束 End])

    Return401 --> End2
    Return429 --> End2

    style Start fill:#90EE90
    style PrepareCall fill:#90EE90
    style End1 fill:#FFB6C1
    style End2 fill:#FFB6C1
    style ValidateKey fill:#FFE4B5
    style CheckRate fill:#FFE4B5
    style ShowOnce fill:#FF6B6B,color:#FFF
    style ProcessBatch fill:#87CEEB
```

## 流程说明

### 🔑 API Key 管理流程

#### 1. 创建 API Key

**步骤：**
1. 用户进入 API 设置页面
2. 点击"创建新 API Key"
3. 配置权限和速率限制：
   - **权限类型**：
     - 只读（Read-Only）：只能查询链接、导出数据
     - 读写（Read-Write）：可创建、修改、删除链接
   - **速率限制**：默认 1,000 次/小时（可自定义）
4. 系统生成随机 API Key（如 `tinybridge_sk_a8f3j29f...`）
5. 使用 **SHA256** 哈希后存储到数据库
6. **仅显示一次**原始 Key（⚠️ 用户必须立即保存）

**安全设计：**
```
原始 Key: tinybridge_sk_a8f3j29fj2f8h3f8h2f8h3f8h2f8h3f8
存储值:  SHA256(tinybridge_sk_a8f3j29fj2f8h3f8h2f8h3f8h2f8h3f8)
        = 7d8f4e2a3b1c9f6e...

即使数据库泄露，攻击者也无法获得原始 Key
```

#### 2. 撤销 API Key

**步骤：**
1. 用户点击"撤销 Key"
2. 系统立即在 **Redis** 中标记为失效
3. 从数据库删除记录
4. 所有使用该 Key 的 API 请求立即返回 401

---

### 📦 批量操作流程

#### 1. 批量导入（Batch Import）

**请求示例：**
```bash
curl -X POST https://api.tinybridge.link/v1/links/batch \
  -H "Authorization: Bearer tinybridge_sk_a8f3j29f..." \
  -H "Content-Type: application/json" \
  -d '{
    "links": [
      {
        "original_url": "https://example.com/page1",
        "title": "Page 1"
      },
      {
        "original_url": "https://example.com/page2",
        "title": "Page 2"
      }
    ]
  }'
```

**处理流程：**
1. **验证 API Key**：查询数据库，检查哈希值
2. **检查速率限制**：Redis 滑动窗口计数器
3. **验证 URLs**：检查每个 URL 格式
4. **批量生成短码**：Base62 + Bloom Filter
5. **保存到数据库**：事务保证原子性
6. **返回结果**：
   ```json
   {
     "success": [
       {"original_url": "...", "short_url": "https://tinybridge.link/aB3xY9"},
       {"original_url": "...", "short_url": "https://tinybridge.link/cD4zW8"}
     ],
     "failed": [
       {"original_url": "invalid-url", "error": "Invalid URL format"}
     ]
   }
   ```

#### 2. 批量导出（Batch Export）

**请求示例：**
```bash
curl -X GET "https://api.tinybridge.link/v1/links/export?format=csv" \
  -H "Authorization: Bearer tinybridge_sk_a8f3j29f..."
```

**返回数据（CSV）：**
```csv
short_code,original_url,created_at,click_count,status
aB3xY9,https://example.com/page1,2025-01-10T10:00:00Z,1247,active
cD4zW8,https://example.com/page2,2025-01-10T11:00:00Z,234,active
```

---

### 🛡️ 安全机制

#### 1. API Key 验证
```
请求头: Authorization: Bearer tinybridge_sk_a8f3j29f...
验证:   SHA256(tinybridge_sk_a8f3j29f...) == DB 存储的哈希值
```

#### 2. 速率限制（滑动窗口算法）
```python
# Redis 实现
key = f"ratelimit:{api_key_hash}:{current_hour}"
count = redis.incr(key)
redis.expire(key, 3600)  # 1 小时过期

if count > 1000:
    return 429  # Too Many Requests
```

**响应头示例：**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 1800
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705320000
```

#### 3. 错误处理

| HTTP 状态码 | 说明 | 解决方案 |
|-------------|------|----------|
| **401 Unauthorized** | API Key 无效或已撤销 | 检查 Key 是否正确、是否已过期 |
| **429 Too Many Requests** | 超过速率限制 | 等待 `Retry-After` 秒后重试 |
| **400 Bad Request** | 请求格式错误 | 检查 JSON 格式、URL 有效性 |
| **500 Internal Server Error** | 服务器错误 | 联系技术支持 |

---

### 📊 性能优化

| 优化策略 | 说明 |
|----------|------|
| **批量插入** | 使用 PostgreSQL `INSERT ... VALUES (...)` 批量插入 |
| **异步处理** | 大批量请求（> 1000 条）使用后台任务处理 |
| **限流保护** | 防止恶意滥用 API |
| **缓存验证** | API Key 验证结果缓存 5 分钟 |

---

### 💡 使用场景示例

**场景：Jack 为 50 个团队成员生成推荐链接**

```python
import requests
import csv

API_KEY = "tinybridge_sk_a8f3j29f..."
API_ENDPOINT = "https://api.tinybridge.link/v1/links/batch"

# 读取团队成员列表
members = []
with open('team_members.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        members.append({
            "original_url": f"https://event.com/register?ref={row['member_id']}",
            "title": f"Referral - {row['name']}"
        })

# 批量创建短链接
response = requests.post(
    API_ENDPOINT,
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"links": members}
)

# 保存结果
if response.status_code == 200:
    result = response.json()
    print(f"✅ 成功创建 {len(result['success'])} 个短链接")

    with open('generated_links.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Short URL'])
        for item in result['success']:
            writer.writerow([item['title'], item['short_url']])
```

**输出：**
```
✅ 成功创建 50 个短链接
已保存到 generated_links.csv
```

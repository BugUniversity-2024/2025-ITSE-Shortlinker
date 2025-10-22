# Picture 2-5: Use Case Diagram of Short Link Creation and Management
# 图 2-5:短链接创建与管理的用例图

```mermaid
graph TB
    User([用户<br>User])
    Visitor([访客<br>Visitor])

    subgraph "短链接管理系统<br>Short Link Management System"
        CreateLink[创建短链接<br>Create Short Link]
        CustomCode[自定义短码<br>Customize Short Code]
        ViewLinks[查看链接列表<br>View Link List]
        EditLink[编辑链接<br>Edit Link]
        DeleteLink[删除链接<br>Delete Link]
        RedirectLink[访问短链接<br>Access Short Link]
        ToggleStatus[启用/禁用链接<br>Toggle Link Status]
    end

    Database[(数据库<br>Database)]
    Redis[(Redis<br>缓存)]
    BloomFilter[布隆过滤器<br>Bloom Filter]

    User -->|创建| CreateLink
    User -->|查看| ViewLinks
    User -->|编辑| EditLink
    User -->|删除| DeleteLink
    User -->|启用/禁用| ToggleStatus

    Visitor -->|访问| RedirectLink

    CreateLink ..>|可选| CustomCode
    CreateLink -->|检查冲突| BloomFilter
    CreateLink -->|保存映射| Database
    CreateLink -->|写入缓存| Redis

    ViewLinks -->|查询| Database
    ViewLinks -->|读取缓存| Redis

    EditLink -->|更新数据| Database
    EditLink -->|更新缓存| Redis

    DeleteLink -->|软删除| Database
    DeleteLink -->|清除缓存| Redis

    ToggleStatus -->|更新状态| Database
    ToggleStatus -->|清除缓存| Redis

    RedirectLink -->|查询映射| Redis
    RedirectLink -.->|缓存未命中| Database
    RedirectLink -->|302重定向| RedirectLink

    style User fill:#10B981,color:#fff
    style Visitor fill:#F59E0B,color:#fff
    style CreateLink fill:#3B82F6,color:#fff
    style CustomCode fill:#8B5CF6,color:#fff
    style ViewLinks fill:#3B82F6,color:#fff
    style EditLink fill:#3B82F6,color:#fff
    style DeleteLink fill:#EF4444,color:#fff
    style RedirectLink fill:#10B981,color:#fff
    style ToggleStatus fill:#F59E0B,color:#fff
    style Database fill:#6366F1,color:#fff
    style Redis fill:#EF4444,color:#fff
    style BloomFilter fill:#EC4899,color:#fff
```

## 用例说明

### 参与者 (Actors)
- **用户 (User)**: 已登录的平台用户,可以创建和管理短链接
- **访客 (Visitor)**: 未登录的访问者,可以访问短链接
- **数据库 (Database)**: 持久化存储短链接映射
- **Redis**: 缓存短链接映射,加速重定向
- **布隆过滤器 (Bloom Filter)**: 快速检测短码冲突

---

### 用例详解

#### 1. 创建短链接 (Create Short Link)

**前置条件**: 用户已登录

**主要流程**:
1. 用户点击"创建新链接"按钮
2. 用户输入原始 URL
3. 系统验证 URL 格式 (http/https 协议)
4. 系统生成随机 Base62 短码 (6-8 字符)
5. 系统通过布隆过滤器检查短码是否存在
6. 系统保存短链接到数据库
7. 系统将短码添加到布隆过滤器
8. 系统缓存映射到 Redis (TTL: 24h)
9. 系统返回生成的短链接给用户

**异常流程**:
- URL 格式无效 → 提示"请输入有效的 URL (http/https)"
- 布隆过滤器检测到冲突 → 重新生成短码 (最多尝试 5 次)
- 数据库写入失败 → 提示"创建失败,请重试"

**扩展用例**:
- **自定义短码 (Customize Short Code)**:
  - 用户选择"使用自定义短码"选项
  - 用户输入期望的短码 (4-12 字符,仅字母数字)
  - 系统验证短码格式和唯一性
  - 若短码已被占用 → 提示"该短码已被使用,请更换"

**性能指标**:
- 创建响应时间 < 500ms
- 布隆过滤器查询时间 < 0.1ms
- 短码冲突率 < 0.01%

---

#### 2. 查看链接列表 (View Link List)

**前置条件**: 用户已登录

**主要流程**:
1. 用户进入"我的链接"页面
2. 系统查询用户的所有短链接 (分页,每页 10 条)
3. 系统尝试从 Redis 获取缓存的链接列表
4. 若缓存未命中,从数据库查询并缓存 (TTL: 5min)
5. 系统返回链接列表 (包含短码、原始 URL、点击数、创建时间、状态)
6. 用户可以搜索、排序、筛选链接

**排序选项**:
- 按创建时间排序 (默认)
- 按点击数排序
- 按最后访问时间排序

**筛选选项**:
- 活跃链接 / 已禁用链接
- 有落地页 / 无落地页
- 已过期 / 未过期

**性能指标**:
- 列表加载时间 < 1s
- 支持 10,000+ 链接的分页查询

---

#### 3. 编辑链接 (Edit Link)

**前置条件**: 用户已登录且拥有该链接

**主要流程**:
1. 用户在链接详情页点击"编辑"
2. 用户修改原始 URL 或其他属性
3. 系统验证修改内容
4. 系统更新数据库记录
5. 系统更新 Redis 缓存
6. 系统返回更新后的链接信息

**可编辑属性**:
- 原始 URL
- 过期时间
- 自定义域名
- 描述信息

**不可编辑属性**:
- 短码 (创建后不可修改)
- 创建时间
- 点击数

**异常流程**:
- 用户无权限编辑 → 403 Forbidden
- URL 格式无效 → 提示格式错误

---

#### 4. 删除链接 (Delete Link)

**前置条件**: 用户已登录且拥有该链接

**主要流程**:
1. 用户点击"删除"按钮
2. 系统显示确认对话框
3. 用户确认删除
4. 系统软删除链接 (设置 is_active = false)
5. 系统清除 Redis 缓存
6. 系统清除用户链接列表缓存
7. 系统返回删除成功提示

**软删除 vs 硬删除**:
- **软删除 (推荐)**: 保留数据,设置 `is_active = false`,访问时返回 404
- **硬删除 (可选)**: 完全删除数据库记录,点击日志保留

**异常流程**:
- 用户无权限删除 → 403 Forbidden
- 链接已被删除 → 404 Not Found

---

#### 5. 启用/禁用链接 (Toggle Link Status)

**前置条件**: 用户已登录且拥有该链接

**主要流程**:
1. 用户点击"启用/禁用"开关
2. 系统更新 `is_active` 状态
3. 系统更新数据库
4. 系统清除 Redis 缓存
5. 系统返回新状态

**用途**:
- 临时禁用链接 (活动结束)
- 快速启用链接 (无需重新创建)

---

#### 6. 访问短链接 (Access Short Link)

**前置条件**: 短链接已创建

**主要流程**:
1. 访客访问 `https://tinybridge.link/{short_code}`
2. 系统从 Redis 获取原始 URL
3. 若缓存命中,直接返回 302 重定向
4. 若缓存未命中,查询数据库
5. 系统将映射写入 Redis (TTL: 24h)
6. 系统异步记录点击日志 (不阻塞重定向)
7. 系统返回 302 重定向到原始 URL

**异步点击日志记录**:
- 提取 IP 地址并哈希 (SHA256 + 每日 Salt)
- 解析 User-Agent (设备类型、浏览器、操作系统)
- 调用 GeoIP 解析地理位置
- 写入 `click_logs` 表
- 更新短链接的 `click_count` 字段

**异常流程**:
- 短码不存在 → 404 Not Found
- 链接已被禁用 → 410 Gone
- 链接已过期 → 410 Gone

**性能指标**:
- 重定向响应时间 < 10ms (Redis 缓存命中)
- 重定向响应时间 < 100ms (缓存未命中)
- 支持 5,000 req/s 并发

---

### 用例关系图

```
创建短链接
    └── <<extend>> 自定义短码

访问短链接
    └── <<include>> 记录点击日志

编辑链接
    └── <<precondition>> 用户已登录

删除链接
    └── <<precondition>> 用户已登录
```

---

### 数据流

#### 创建短链接数据流
```
用户输入 URL
    ↓
验证格式
    ↓
生成/验证短码
    ↓
布隆过滤器检查 (0.1ms)
    ↓
数据库写入 (50ms)
    ↓
Redis 缓存 (1ms)
    ↓
返回短链接
```

#### 访问短链接数据流
```
访客访问短链接
    ↓
Redis 查询 (1ms)
    ├── 缓存命中 → 立即重定向 (10ms)
    └── 缓存未命中
            ↓
        数据库查询 (10ms)
            ↓
        写入 Redis 缓存
            ↓
        返回重定向 (100ms)
    ↓
异步记录点击日志 (不阻塞)
```

---

### 安全措施

| 措施 | 说明 |
|------|------|
| **权限验证** | 仅允许链接所有者编辑/删除 |
| **URL 验证** | 仅允许 http/https 协议,防止 javascript: 等恶意协议 |
| **速率限制** | 每用户每天最多创建 100 个链接 |
| **短码格式** | 4-12 字符,仅字母数字,防止恶意短码 (如 admin, api) |
| **软删除** | 保留历史数据,支持审计和恢复 |

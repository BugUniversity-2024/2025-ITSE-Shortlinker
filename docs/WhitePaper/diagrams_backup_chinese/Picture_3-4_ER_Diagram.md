# Picture 3-4: E-R Diagram of Database Data Model
# 图 3-4：数据库数据模型 E-R 图

```mermaid
erDiagram
    User ||--o{ ShortLink : creates
    User ||--o{ Team : owns
    User ||--o{ APIKey : generates
    User }o--o{ Team : "member of"

    Team ||--o{ ShortLink : manages

    ShortLink ||--o{ ClickLog : "records clicks"
    ShortLink ||--o| LandingPage : "has optional"

    User {
        int id PK
        string username UK
        string email UK
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    Team {
        int id PK
        string team_name
        int owner_id FK
        timestamp created_at
    }

    ShortLink {
        int id PK
        int user_id FK
        int team_id FK "nullable"
        text original_url
        string short_code UK
        string custom_domain "nullable"
        string custom_path "nullable"
        timestamp created_at
        timestamp expires_at "nullable"
        int click_count
        boolean is_active
    }

    ClickLog {
        int id PK
        int link_id FK
        timestamp clicked_at
        string ip_hash "SHA256"
        text user_agent
        text referrer "nullable"
        string country
        string city
        string device_type "mobile/desktop/tablet"
        string browser
        string os
    }

    LandingPage {
        int id PK
        int link_id FK UK
        text html_content
        text css_content
        int template_id "nullable"
        timestamp created_at
        timestamp updated_at
    }

    APIKey {
        int id PK
        int user_id FK
        string key_hash "SHA256"
        json permissions
        int rate_limit
        timestamp created_at
        timestamp expires_at "nullable"
        timestamp last_used "nullable"
    }
```

## 实体关系说明

### 关系类型

| 关系 | 基数 | 说明 |
|------|------|------|
| **User → ShortLink** | 1:N | 一个用户可以创建多个短链接 |
| **User → Team** | 1:N | 一个用户可以拥有多个团队（作为 owner） |
| **User → APIKey** | 1:N | 一个用户可以生成多个 API 密钥 |
| **User ↔ Team** | N:M | 一个用户可以加入多个团队，一个团队有多个成员 |
| **Team → ShortLink** | 1:N | 一个团队可以管理多个短链接 |
| **ShortLink → ClickLog** | 1:N | 一个短链接有多条点击记录 |
| **ShortLink → LandingPage** | 1:0..1 | 一个短链接可以有 0 或 1 个落地页 |

---

### 核心实体详解

#### 1️⃣ User（用户）
**主键：** `id`
**唯一键：** `username`, `email`

**字段说明：**
- `password_hash`：使用 **Argon2** 算法哈希存储（SHA-512 + Salt）
- `created_at`：注册时间
- `updated_at`：最后更新时间

**关联关系：**
- 创建多个 `ShortLink`
- 拥有多个 `Team`（作为团队所有者）
- 生成多个 `APIKey`
- 加入多个 `Team`（作为团队成员）

---

#### 2️⃣ Team（团队）
**主键：** `id`
**外键：** `owner_id` → `User.id`

**字段说明：**
- `team_name`：团队名称
- `owner_id`：团队所有者的用户 ID
- `created_at`：创建时间

**关联关系：**
- 由一个 `User` 拥有
- 管理多个 `ShortLink`
- 包含多个 `User` 成员（N:M 关系，需中间表 `team_members`）

**中间表设计：**
```sql
CREATE TABLE team_members (
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(20),  -- owner, admin, member
  joined_at TIMESTAMP,
  PRIMARY KEY (team_id, user_id)
);
```

---

#### 3️⃣ ShortLink（短链接）
**主键：** `id`
**唯一键：** `short_code`
**外键：** `user_id` → `User.id`, `team_id` → `Team.id`

**字段说明：**
- `original_url`：原始目标 URL
- `short_code`：短码（Base62 编码，6-8 字符）
- `custom_domain`：自定义域名（可选）
- `custom_path`：自定义路径前缀（可选）
- `expires_at`：过期时间（可选）
- `click_count`：点击统计（冗余字段，用于快速查询）
- `is_active`：是否激活（用于软删除）

**索引：**
```sql
CREATE UNIQUE INDEX idx_short_code ON short_links(short_code);
CREATE INDEX idx_user_id ON short_links(user_id);
CREATE INDEX idx_team_id ON short_links(team_id);
CREATE INDEX idx_created_at ON short_links(created_at);
```

**关联关系：**
- 属于一个 `User`
- 可选属于一个 `Team`
- 有多条 `ClickLog`
- 可选有一个 `LandingPage`

---

#### 4️⃣ ClickLog（点击日志）
**主键：** `id`
**外键：** `link_id` → `ShortLink.id`

**字段说明：**
- `clicked_at`：点击时间
- `ip_hash`：**SHA256(IP + 每日 Salt)**（隐私保护）
- `user_agent`：浏览器 User-Agent 字符串
- `referrer`：来源页面 URL
- `country`/`city`：通过 GeoIP 解析
- `device_type`：设备类型（mobile/desktop/tablet）
- `browser`：浏览器类型（Chrome/Safari/Firefox/Edge）
- `os`：操作系统（Windows/macOS/iOS/Android/Linux）

**索引：**
```sql
CREATE INDEX idx_link_id ON click_logs(link_id);
CREATE INDEX idx_clicked_at ON click_logs(clicked_at);
CREATE INDEX idx_country_city ON click_logs(country, city);
```

**隐私保护机制：**
```javascript
// IP 哈希算法
const crypto = require('crypto')
const dailySalt = getDailySalt()  // 每日轮换
const ipHash = crypto
  .createHash('sha256')
  .update(ip + dailySalt)
  .digest('hex')

// 原始 IP: 8.8.8.8
// 存储值: 7d8f4e2a3b1c9f6e... (不可逆)
```

**关联关系：**
- 属于一个 `ShortLink`

---

#### 5️⃣ LandingPage（落地页）
**主键：** `id`
**唯一键：** `link_id`
**外键：** `link_id` → `ShortLink.id`

**字段说明：**
- `html_content`：HTML 源码（通过 DOMPurify 清理）
- `css_content`：CSS 样式代码
- `template_id`：基于的模板 ID（可选）
- `created_at`：创建时间
- `updated_at`：最后更新时间

**关联关系：**
- 属于一个 `ShortLink`（1:1 关系）

---

#### 6️⃣ APIKey（API 密钥）
**主键：** `id`
**外键：** `user_id` → `User.id`

**字段说明：**
- `key_hash`：**SHA256(原始 API Key)**（不存储原文）
- `permissions`：权限配置（JSON 格式）
  ```json
  {
    "read": true,
    "write": true,
    "delete": false
  }
  ```
- `rate_limit`：速率限制（每小时请求次数，默认 1000）
- `created_at`：创建时间
- `expires_at`：过期时间（可选）
- `last_used`：最后使用时间

**关联关系：**
- 属于一个 `User`

---

### 数据库约束

#### 外键约束（ON DELETE 策略）

| 关系 | ON DELETE 行为 | 说明 |
|------|---------------|------|
| `ShortLink.user_id` → `User.id` | CASCADE | 删除用户时，删除其所有短链接 |
| `ShortLink.team_id` → `Team.id` | SET NULL | 删除团队时，短链接归属个人 |
| `ClickLog.link_id` → `ShortLink.id` | CASCADE | 删除短链接时，删除点击日志 |
| `LandingPage.link_id` → `ShortLink.id` | CASCADE | 删除短链接时，删除落地页 |
| `APIKey.user_id` → `User.id` | CASCADE | 删除用户时，撤销其 API Keys |
| `Team.owner_id` → `User.id` | CASCADE | 删除用户时，删除其拥有的团队 |

---

### 性能优化建议

#### 1. 索引策略
```sql
-- 高频查询字段
CREATE INDEX idx_short_code ON short_links(short_code);  -- 重定向查询
CREATE INDEX idx_link_clicked ON click_logs(link_id, clicked_at);  -- 分析查询
CREATE INDEX idx_user_active ON short_links(user_id, is_active);  -- 用户链接列表

-- 复合索引
CREATE INDEX idx_click_analytics ON click_logs(link_id, clicked_at, country);
```

#### 2. 分区表（PostgreSQL）
```sql
-- 按时间分区 ClickLog 表
CREATE TABLE click_logs (
  ...
) PARTITION BY RANGE (clicked_at);

CREATE TABLE click_logs_2025_01 PARTITION OF click_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### 3. 归档策略
- **ClickLog**：保留 90 天，旧数据归档到冷存储
- **ShortLink**：已过期且 180 天无访问的链接软删除

---

### E-R 模型的设计原则

✅ **第三范式（3NF）**：消除冗余，每个非主属性完全依赖于主键
✅ **外键完整性**：确保引用完整性
✅ **索引优化**：为高频查询字段建立索引
✅ **隐私保护**：敏感数据哈希存储（IP、API Key、密码）
✅ **扩展性**：支持团队协作、自定义域名等高级功能

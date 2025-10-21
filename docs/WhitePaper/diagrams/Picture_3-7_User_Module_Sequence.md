# Picture 3-7: User Module Sequence Diagram
# 图 3-7:用户模块序列图

```mermaid
sequenceDiagram
    participant Client as 客户端<br>Client
    participant Controller as 控制器<br>UserController
    participant Service as 服务层<br>UserService
    participant Repository as 仓储层<br>UserRepository
    participant Redis as Redis<br>缓存
    participant DB as PostgreSQL<br>数据库

    Note over Client,DB: 用户注册流程 User Registration Flow

    Client->>Controller: POST /api/auth/register<br>{email, username, password}
    Controller->>Controller: 验证输入格式<br>Validate Input (Joi/Zod)

    Controller->>Service: register(userData)
    Service->>Repository: findByEmail(email)
    Repository->>DB: SELECT * FROM users<br>WHERE email = ?
    DB-->>Repository: null (用户不存在)
    Repository-->>Service: null

    Service->>Service: 检查用户名唯一性<br>Check Username Unique
    Service->>Repository: findByUsername(username)
    Repository->>DB: SELECT * FROM users<br>WHERE username = ?
    DB-->>Repository: null (用户名可用)
    Repository-->>Service: null

    Service->>Service: 哈希密码<br>Hash Password (Argon2)
    Service->>Service: 生成验证码<br>Generate Verification Code

    Service->>Repository: create(userData)
    Repository->>DB: INSERT INTO users<br>(email, username, password_hash,<br>is_verified: false)
    DB-->>Repository: User ID: 12345
    Repository-->>Service: User Object

    Service->>Redis: SET verify:12345<br>verification_code<br>TTL: 10min
    Redis-->>Service: OK

    Service->>Service: 发送验证邮件<br>Send Verification Email
    Service-->>Controller: {success: true, user_id: 12345}
    Controller-->>Client: 201 Created<br>{message: "注册成功,请验证邮箱"}

    Note over Client,DB: 邮箱验证流程 Email Verification Flow

    Client->>Controller: POST /api/auth/verify<br>{user_id: 12345, code: "ABC123"}
    Controller->>Service: verifyEmail(user_id, code)

    Service->>Redis: GET verify:12345
    Redis-->>Service: "ABC123"

    Service->>Service: 比对验证码<br>Compare Codes

    Service->>Repository: update(user_id, {is_verified: true})
    Repository->>DB: UPDATE users<br>SET is_verified = true<br>WHERE id = 12345
    DB-->>Repository: OK
    Repository-->>Service: Updated User

    Service->>Redis: DEL verify:12345
    Redis-->>Service: OK

    Service-->>Controller: {success: true}
    Controller-->>Client: 200 OK<br>{message: "验证成功"}

    Note over Client,DB: 用户登录流程 User Login Flow

    Client->>Controller: POST /api/auth/login<br>{email, password}
    Controller->>Controller: 验证输入<br>Validate Input

    Controller->>Service: login(email, password)

    Service->>Redis: GET user:email:{email}
    Redis-->>Service: Cache Miss

    Service->>Repository: findByEmail(email)
    Repository->>DB: SELECT * FROM users<br>WHERE email = ?
    DB-->>Repository: User Object
    Repository-->>Service: User Object

    Service->>Redis: SET user:email:{email}<br>user_object<br>TTL: 1h
    Redis-->>Service: OK

    Service->>Service: 验证密码<br>Verify Password (Argon2)
    Service->>Service: 生成 JWT Token<br>Generate JWT<br>(exp: 7d)

    Service->>Redis: SET session:{user_id}<br>token_hash<br>TTL: 7d
    Redis-->>Service: OK

    Service-->>Controller: {token, user_profile}
    Controller-->>Client: 200 OK<br>{token: "eyJhbGc...",<br>user: {...}}

    Note over Client,DB: 获取用户资料 Get User Profile

    Client->>Controller: GET /api/users/profile<br>Authorization: Bearer {token}
    Controller->>Controller: 验证 JWT Token<br>Verify JWT

    Controller->>Service: getProfile(user_id)

    Service->>Redis: GET user:profile:{user_id}
    Redis-->>Service: Cached Profile

    Service-->>Controller: User Profile
    Controller-->>Client: 200 OK<br>{user: {...}}

    Note over Client,DB: 更新用户资料 Update User Profile

    Client->>Controller: PATCH /api/users/profile<br>{username: "new_name"}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证输入<br>Validate Input

    Controller->>Service: updateProfile(user_id, data)
    Service->>Repository: update(user_id, data)
    Repository->>DB: UPDATE users<br>SET username = ?<br>WHERE id = ?
    DB-->>Repository: Updated User
    Repository-->>Service: User Object

    Service->>Redis: DEL user:profile:{user_id}
    Service->>Redis: DEL user:email:{email}
    Redis-->>Service: OK

    Service-->>Controller: Updated User
    Controller-->>Client: 200 OK<br>{user: {...}}

    style Client fill:#E3F2FD
    style Controller fill:#C8E6C9
    style Service fill:#FFF9C4
    style Repository fill:#FFE0B2
    style Redis fill:#FFCCBC
    style DB fill:#F8BBD0
```

## 模块说明

### 🏗️ 用户模块架构

用户模块采用 **Controller-Service-Repository** 三层架构，负责处理用户认证、授权和资料管理。

---

### 1️⃣ 注册流程详解

#### 输入验证（Controller 层）

```typescript
// 使用 Zod 进行输入验证
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  username: z.string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字、下划线'),
  password: z.string()
    .min(8, '密码至少 8 个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
})

// 控制器中使用
export async function register(req, res) {
  try {
    const validatedData = registerSchema.parse(req.body)
    const result = await userService.register(validatedData)
    res.status(201).json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }
    throw error
  }
}
```

#### 密码哈希（Service 层）

```typescript
import argon2 from 'argon2'

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,  // 推荐的哈希类型
    memoryCost: 65536,      // 64 MB
    timeCost: 3,            // 迭代次数
    parallelism: 4          // 线程数
  })
}

// 注册服务
async function register(userData) {
  // 1. 检查邮箱唯一性
  const existingUser = await userRepository.findByEmail(userData.email)
  if (existingUser) {
    throw new Error('邮箱已被注册')
  }

  // 2. 检查用户名唯一性
  const existingUsername = await userRepository.findByUsername(userData.username)
  if (existingUsername) {
    throw new Error('用户名已被占用')
  }

  // 3. 哈希密码
  const passwordHash = await hashPassword(userData.password)

  // 4. 创建用户
  const user = await userRepository.create({
    email: userData.email,
    username: userData.username,
    password_hash: passwordHash,
    is_verified: false
  })

  // 5. 生成验证码
  const verificationCode = generateRandomCode(6)  // 6 位数字
  await redis.set(
    `verify:${user.id}`,
    verificationCode,
    'EX',
    600  // 10 分钟过期
  )

  // 6. 发送验证邮件
  await sendVerificationEmail(user.email, verificationCode)

  return { success: true, user_id: user.id }
}
```

---

### 2️⃣ 邮箱验证流程

```typescript
async function verifyEmail(userId: number, code: string) {
  // 1. 从 Redis 获取验证码
  const storedCode = await redis.get(`verify:${userId}`)

  if (!storedCode) {
    throw new Error('验证码已过期，请重新注册')
  }

  // 2. 比对验证码
  if (storedCode !== code) {
    throw new Error('验证码错误')
  }

  // 3. 更新用户状态
  await userRepository.update(userId, { is_verified: true })

  // 4. 删除验证码
  await redis.del(`verify:${userId}`)

  return { success: true }
}
```

---

### 3️⃣ 登录流程详解

#### JWT Token 生成

```typescript
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

async function login(email: string, password: string) {
  // 1. 查询用户（优先从缓存）
  let user = await redis.get(`user:email:${email}`)

  if (!user) {
    user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('用户不存在')
    }

    // 缓存用户信息
    await redis.set(
      `user:email:${email}`,
      JSON.stringify(user),
      'EX',
      3600  // 1 小时
    )
  } else {
    user = JSON.parse(user)
  }

  // 2. 检查邮箱是否已验证
  if (!user.is_verified) {
    throw new Error('请先验证邮箱')
  }

  // 3. 验证密码
  const isValid = await argon2.verify(user.password_hash, password)
  if (!isValid) {
    throw new Error('密码错误')
  }

  // 4. 生成 JWT Token
  const token = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',  // 7 天有效期
      issuer: 'tinybridge.link'
    }
  )

  // 5. 存储 Token 哈希到 Redis（用于会话管理）
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await redis.set(
    `session:${user.id}`,
    tokenHash,
    'EX',
    7 * 24 * 3600  // 7 天
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at
    }
  }
}
```

#### JWT 验证中间件

```typescript
// 中间件：验证 JWT Token
export async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  const token = authHeader.substring(7)  // 去除 "Bearer "

  try {
    // 1. 验证 JWT 签名和有效期
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 2. 检查会话是否存在（防止 Token 被撤销）
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const storedHash = await redis.get(`session:${decoded.user_id}`)

    if (storedHash !== tokenHash) {
      return res.status(401).json({ error: 'Session expired or revoked' })
    }

    // 3. 将用户信息附加到请求对象
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    throw error
  }
}
```

---

### 4️⃣ 获取用户资料

```typescript
async function getProfile(userId: number) {
  // 1. 优先从 Redis 缓存获取
  const cached = await redis.get(`user:profile:${userId}`)

  if (cached) {
    return JSON.parse(cached)
  }

  // 2. 从数据库查询
  const user = await userRepository.findById(userId)

  if (!user) {
    throw new Error('用户不存在')
  }

  // 3. 构建返回数据（移除敏感字段）
  const profile = {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at
  }

  // 4. 缓存到 Redis
  await redis.set(
    `user:profile:${userId}`,
    JSON.stringify(profile),
    'EX',
    3600  // 1 小时
  )

  return profile
}
```

---

### 5️⃣ 更新用户资料

```typescript
async function updateProfile(userId: number, updateData: any) {
  // 1. 验证更新数据
  const allowedFields = ['username', 'avatar_url']
  const filteredData = Object.keys(updateData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key]
      return obj
    }, {})

  // 2. 检查用户名唯一性（如果更新用户名）
  if (filteredData.username) {
    const existing = await userRepository.findByUsername(filteredData.username)
    if (existing && existing.id !== userId) {
      throw new Error('用户名已被占用')
    }
  }

  // 3. 更新数据库
  const updatedUser = await userRepository.update(userId, filteredData)

  // 4. 清除缓存
  await redis.del(`user:profile:${userId}`)

  // 如果有邮箱缓存也删除
  const user = await userRepository.findById(userId)
  await redis.del(`user:email:${user.email}`)

  return updatedUser
}
```

---

### 🔒 安全措施

| 措施 | 实现方式 |
|------|----------|
| **密码存储** | Argon2id 哈希（内存成本 64MB，迭代 3 次） |
| **JWT 签名** | HS256 算法 + 环境变量密钥 |
| **会话管理** | Redis 存储 Token 哈希，支持撤销 |
| **输入验证** | Zod schema 验证 |
| **速率限制** | 登录失败 5 次锁定 15 分钟 |
| **邮箱验证** | 10 分钟有效期 + 一次性验证码 |

---

### ⚡ 性能指标

| 操作 | 响应时间 | 说明 |
|------|----------|------|
| **注册** | < 500ms | 包含密码哈希和邮件发送（异步） |
| **登录** | < 200ms | Redis 缓存命中率 > 80% |
| **获取资料** | < 50ms | Redis 缓存命中率 > 95% |
| **更新资料** | < 300ms | 包含数据库写入和缓存清除 |

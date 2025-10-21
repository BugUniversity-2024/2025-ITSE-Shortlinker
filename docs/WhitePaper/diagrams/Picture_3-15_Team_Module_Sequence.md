# Picture 3-15: Team Module Sequence Diagram
# 图 3-15:团队模块序列图

```mermaid
sequenceDiagram
    participant Client as 客户端<br>Client
    participant Controller as 控制器<br>TeamController
    participant Service as 服务层<br>TeamService
    participant Repository as 仓储层<br>TeamRepository
    participant Redis as Redis<br>缓存
    participant DB as PostgreSQL<br>数据库

    Note over Client,DB: 创建团队流程 Create Team Flow

    Client->>Controller: POST /api/teams<br>{team_name}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证团队名称<br>Validate Team Name

    Controller->>Service: createTeam(user_id, team_name)

    Service->>Repository: create({team_name, owner_id: user_id})
    Repository->>DB: INSERT INTO teams<br>(team_name, owner_id, created_at)
    DB-->>Repository: Team ID: 54321
    Repository-->>Service: Team Object

    Service->>Repository: addMember(team_id, user_id, role: 'owner')
    Repository->>DB: INSERT INTO team_members<br>(team_id, user_id, role, joined_at)
    DB-->>Repository: OK
    Repository-->>Service: OK

    Service->>Redis: DEL teams:user:{user_id}
    Redis-->>Service: OK

    Service-->>Controller: Team Object
    Controller-->>Client: 201 Created<br>{team: {id, team_name, role: 'owner'}}

    Note over Client,DB: 邀请成员流程 Invite Member Flow

    Client->>Controller: POST /api/teams/:team_id/invite<br>{email, role}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Admin Permission

    Controller->>Service: inviteMember(team_id, inviter_id, email, role)

    Service->>Repository: findTeamById(team_id)
    Repository->>DB: SELECT * FROM teams<br>WHERE id = ?
    DB-->>Repository: Team Object
    Repository-->>Service: Team Object

    Service->>Repository: getMemberRole(team_id, inviter_id)
    Repository->>DB: SELECT role FROM team_members<br>WHERE team_id = ? AND user_id = ?
    DB-->>Repository: {role: 'owner'} or {role: 'admin'}
    Repository-->>Service: {role}

    alt 非管理员 Not Admin
        Service-->>Controller: Error: Forbidden
        Controller-->>Client: 403 Forbidden<br>需要管理员权限
    else 是管理员 Is Admin
        Service->>Repository: findUserByEmail(email)
        Repository->>DB: SELECT id FROM users<br>WHERE email = ?
        DB-->>Repository: User Object
        Repository-->>Service: User Object

        alt 用户不存在 User Not Found
            Service-->>Controller: Error: User Not Found
            Controller-->>Client: 404 Not Found<br>该用户不存在
        else 用户已是成员 User Already Member
            Service->>Repository: checkMembership(team_id, user_id)
            Repository->>DB: SELECT * FROM team_members<br>WHERE team_id = ? AND user_id = ?
            DB-->>Repository: Existing Record
            Repository-->>Service: true
            Service-->>Controller: Error: Already Member
            Controller-->>Client: 409 Conflict<br>用户已是团队成员
        else 发送邀请 Send Invitation
            Service->>Service: 生成邀请码<br>Generate Invite Code
            Service->>Redis: SET invite:{code}<br>{team_id, email, role}<br>TTL: 7d
            Redis-->>Service: OK

            Service->>Service: 发送邀请邮件<br>Send Invite Email
            Service-->>Controller: {invite_code}
            Controller-->>Client: 200 OK<br>{message: '邀请已发送', invite_code}
        end
    end

    Note over Client,DB: 接受邀请流程 Accept Invitation Flow

    Client->>Controller: POST /api/teams/accept-invite<br>{invite_code}
    Controller->>Controller: 验证 JWT<br>Verify JWT

    Controller->>Service: acceptInvitation(user_id, invite_code)

    Service->>Redis: GET invite:{invite_code}
    alt 邀请码无效 Invalid Code
        Redis-->>Service: null
        Service-->>Controller: Error: Invalid Invite
        Controller-->>Client: 404 Not Found<br>邀请码无效或已过期
    else 邀请码有效 Valid Code
        Redis-->>Service: {team_id, email, role}
        Service->>Service: 验证邮箱匹配<br>Verify Email Match

        alt 邮箱不匹配 Email Mismatch
            Service-->>Controller: Error: Email Mismatch
            Controller-->>Client: 403 Forbidden<br>邀请不是发给你的
        else 邮箱匹配 Email Match
            Service->>Repository: addMember(team_id, user_id, role)
            Repository->>DB: INSERT INTO team_members<br>(team_id, user_id, role, joined_at)
            DB-->>Repository: OK
            Repository-->>Service: OK

            Service->>Redis: DEL invite:{invite_code}
            Service->>Redis: DEL teams:user:{user_id}
            Redis-->>Service: OK

            Service-->>Controller: Team Object
            Controller-->>Client: 200 OK<br>{team: {...}, role}
        end
    end

    Note over Client,DB: 获取团队成员列表 Get Team Members

    Client->>Controller: GET /api/teams/:team_id/members
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证成员资格<br>Verify Membership

    Controller->>Service: getMembers(team_id, user_id)

    Service->>Repository: checkMembership(team_id, user_id)
    Repository->>DB: SELECT * FROM team_members<br>WHERE team_id = ? AND user_id = ?
    DB-->>Repository: Member Record
    Repository-->>Service: true

    alt 非成员 Not a Member
        Service-->>Controller: Error: Forbidden
        Controller-->>Client: 403 Forbidden
    else 是成员 Is Member
        Service->>Redis: GET team:{team_id}:members
        alt 缓存命中 Cache Hit
            Redis-->>Service: Cached Members
            Service-->>Controller: Members List
        else 缓存未命中 Cache Miss
            Service->>Repository: getMembers(team_id)
            Repository->>DB: SELECT<br>  u.id, u.username, u.email,<br>  tm.role, tm.joined_at<br>FROM team_members tm<br>JOIN users u ON tm.user_id = u.id<br>WHERE tm.team_id = ?<br>ORDER BY tm.joined_at
            DB-->>Repository: Members Array
            Repository-->>Service: Members List

            Service->>Redis: SET team:{team_id}:members<br>members_list<br>TTL: 10min
            Redis-->>Service: OK

            Service-->>Controller: Members List
        end
        Controller-->>Client: 200 OK<br>{members: [...]}
    end

    Note over Client,DB: 更新成员角色 Update Member Role

    Client->>Controller: PATCH /api/teams/:team_id/members/:user_id<br>{role: 'admin'}
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证 Owner 权限<br>Verify Owner Permission

    Controller->>Service: updateMemberRole(team_id, operator_id, target_user_id, new_role)

    Service->>Repository: getMemberRole(team_id, operator_id)
    Repository->>DB: SELECT role FROM team_members<br>WHERE team_id = ? AND user_id = ?
    DB-->>Repository: {role: 'owner'}
    Repository-->>Service: {role: 'owner'}

    alt 非 Owner Not Owner
        Service-->>Controller: Error: Forbidden
        Controller-->>Client: 403 Forbidden<br>仅 Owner 可修改角色
    else 是 Owner Is Owner
        Service->>Repository: updateRole(team_id, target_user_id, new_role)
        Repository->>DB: UPDATE team_members<br>SET role = ?<br>WHERE team_id = ? AND user_id = ?
        DB-->>Repository: OK
        Repository-->>Service: Updated Member

        Service->>Redis: DEL team:{team_id}:members
        Redis-->>Service: OK

        Service-->>Controller: Updated Member
        Controller-->>Client: 200 OK<br>{member: {...}}
    end

    Note over Client,DB: 移除成员 Remove Member

    Client->>Controller: DELETE /api/teams/:team_id/members/:user_id
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Permission

    Controller->>Service: removeMember(team_id, operator_id, target_user_id)

    Service->>Repository: getMemberRole(team_id, operator_id)
    Repository->>DB: SELECT role FROM team_members<br>WHERE team_id = ? AND user_id = ?
    DB-->>Repository: {role}
    Repository-->>Service: {role}

    alt 自己退出 Self Leave
        Service->>Repository: getMemberRole(team_id, target_user_id)
        Repository->>DB: SELECT role FROM team_members<br>WHERE team_id = ? AND user_id = ?
        DB-->>Repository: {role}
        Repository-->>Service: {role}

        alt Owner 不能自己退出 Owner Cannot Leave
            Service-->>Controller: Error: Owner Cannot Leave
            Controller-->>Client: 403 Forbidden<br>请先转让 Owner 权限
        else 成员退出 Member Leave
            Service->>Repository: removeMember(team_id, target_user_id)
            Repository->>DB: DELETE FROM team_members<br>WHERE team_id = ? AND user_id = ?
            DB-->>Repository: OK
            Repository-->>Service: OK

            Service->>Redis: DEL team:{team_id}:members
            Service->>Redis: DEL teams:user:{target_user_id}
            Redis-->>Service: OK

            Service-->>Controller: Success
            Controller-->>Client: 204 No Content
        end
    else 管理员移除成员 Admin Remove Member
        alt 非管理员 Not Admin
            Service-->>Controller: Error: Forbidden
            Controller-->>Client: 403 Forbidden
        else 管理员移除 Admin Remove
            Service->>Repository: removeMember(team_id, target_user_id)
            Repository->>DB: DELETE FROM team_members<br>WHERE team_id = ? AND user_id = ?
            DB-->>Repository: OK
            Repository-->>Service: OK

            Service->>Redis: DEL team:{team_id}:members
            Service->>Redis: DEL teams:user:{target_user_id}
            Redis-->>Service: OK

            Service-->>Controller: Success
            Controller-->>Client: 204 No Content
        end
    end

    Note over Client,DB: 获取用户团队列表 Get User Teams

    Client->>Controller: GET /api/teams
    Controller->>Controller: 验证 JWT<br>Verify JWT

    Controller->>Service: getUserTeams(user_id)

    Service->>Redis: GET teams:user:{user_id}
    alt 缓存命中 Cache Hit
        Redis-->>Service: Cached Teams
        Service-->>Controller: Teams List
    else 缓存未命中 Cache Miss
        Service->>Repository: getUserTeams(user_id)
        Repository->>DB: SELECT<br>  t.id, t.team_name, t.created_at,<br>  tm.role, tm.joined_at<br>FROM team_members tm<br>JOIN teams t ON tm.team_id = t.id<br>WHERE tm.user_id = ?<br>ORDER BY tm.joined_at DESC
        DB-->>Repository: Teams Array
        Repository-->>Service: Teams List

        Service->>Redis: SET teams:user:{user_id}<br>teams_list<br>TTL: 10min
        Redis-->>Service: OK

        Service-->>Controller: Teams List
    end
    Controller-->>Client: 200 OK<br>{teams: [...]}

    Note over Client,DB: 删除团队 Delete Team

    Client->>Controller: DELETE /api/teams/:team_id
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证 Owner 权限<br>Verify Owner Permission

    Controller->>Service: deleteTeam(team_id, user_id)

    Service->>Repository: getMemberRole(team_id, user_id)
    Repository->>DB: SELECT role FROM team_members<br>WHERE team_id = ? AND user_id = ?
    DB-->>Repository: {role: 'owner'}
    Repository-->>Service: {role: 'owner'}

    alt 非 Owner Not Owner
        Service-->>Controller: Error: Forbidden
        Controller-->>Client: 403 Forbidden<br>仅 Owner 可删除团队
    else 是 Owner Is Owner
        Service->>Repository: deleteTeam(team_id)

        Repository->>DB: DELETE FROM team_members<br>WHERE team_id = ?
        DB-->>Repository: OK

        Repository->>DB: UPDATE short_links<br>SET team_id = NULL<br>WHERE team_id = ?
        DB-->>Repository: OK

        Repository->>DB: DELETE FROM teams<br>WHERE id = ?
        DB-->>Repository: OK

        Repository-->>Service: Success

        Service->>Redis: DEL team:{team_id}:members
        Service->>Redis: DEL teams:user:*
        Redis-->>Service: OK

        Service-->>Controller: Success
        Controller-->>Client: 204 No Content
    end

    style Client fill:#E3F2FD
    style Controller fill:#C8E6C9
    style Service fill:#FFF9C4
    style Repository fill:#FFE0B2
    style Redis fill:#FFCCBC
    style DB fill:#F8BBD0
```

## 模块说明

### 👥 团队模块核心功能

团队模块负责处理团队创建、成员管理、权限控制和团队链接共享。

---

### 1️⃣ 角色权限系统

```typescript
enum TeamRole {
  OWNER = 'owner',      // 所有者 (创建者)
  ADMIN = 'admin',      // 管理员
  MEMBER = 'member'     // 普通成员
}

// 权限矩阵
const PERMISSIONS = {
  [TeamRole.OWNER]: {
    invite_members: true,
    remove_members: true,
    update_roles: true,
    delete_team: true,
    manage_links: true,
    view_analytics: true
  },
  [TeamRole.ADMIN]: {
    invite_members: true,
    remove_members: true,    // 不能移除 owner
    update_roles: false,
    delete_team: false,
    manage_links: true,
    view_analytics: true
  },
  [TeamRole.MEMBER]: {
    invite_members: false,
    remove_members: false,
    update_roles: false,
    delete_team: false,
    manage_links: true,      // 可以管理团队链接
    view_analytics: true
  }
}

// 权限检查
function hasPermission(
  userRole: TeamRole,
  action: keyof typeof PERMISSIONS[TeamRole.OWNER]
): boolean {
  return PERMISSIONS[userRole]?.[action] || false
}

// 使用示例
if (!hasPermission(userRole, 'invite_members')) {
  throw new Error('没有邀请成员的权限')
}
```

---

### 2️⃣ 邀请码生成

```typescript
import crypto from 'crypto'

function generateInviteCode(): string {
  // 生成 16 字节随机数,转为 Base64
  const buffer = crypto.randomBytes(16)
  const code = buffer.toString('base64url')  // URL-safe Base64
  return code
}

async function inviteMember(
  teamId: number,
  inviterId: number,
  email: string,
  role: TeamRole
) {
  // 1. 验证邀请者权限
  const inviterRole = await teamRepository.getMemberRole(teamId, inviterId)
  if (!hasPermission(inviterRole, 'invite_members')) {
    throw new Error('没有邀请权限')
  }

  // 2. 查询被邀请用户
  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw new Error('用户不存在')
  }

  // 3. 检查是否已是成员
  const isMember = await teamRepository.checkMembership(teamId, user.id)
  if (isMember) {
    throw new Error('用户已是团队成员')
  }

  // 4. 生成邀请码
  const inviteCode = generateInviteCode()

  // 5. 存储到 Redis (7 天有效)
  await redis.set(
    `invite:${inviteCode}`,
    JSON.stringify({
      team_id: teamId,
      email,
      role,
      invited_by: inviterId,
      created_at: new Date()
    }),
    'EX',
    7 * 24 * 3600  // 7 天
  )

  // 6. 发送邀请邮件
  await sendInviteEmail(email, {
    team_name: team.team_name,
    inviter_name: inviter.username,
    invite_link: `https://tinybridge.link/teams/invite/${inviteCode}`,
    expires_in: '7 天'
  })

  return { invite_code: inviteCode }
}
```

---

### 3️⃣ 接受邀请

```typescript
async function acceptInvitation(userId: number, inviteCode: string) {
  // 1. 从 Redis 获取邀请信息
  const inviteData = await redis.get(`invite:${inviteCode}`)

  if (!inviteData) {
    throw new Error('邀请码无效或已过期')
  }

  const invite = JSON.parse(inviteData)

  // 2. 验证邮箱匹配
  const user = await userRepository.findById(userId)
  if (user.email !== invite.email) {
    throw new Error('该邀请不是发给你的')
  }

  // 3. 添加到团队
  await teamRepository.addMember({
    team_id: invite.team_id,
    user_id: userId,
    role: invite.role,
    joined_at: new Date()
  })

  // 4. 删除邀请码 (一次性)
  await redis.del(`invite:${inviteCode}`)

  // 5. 清除缓存
  await redis.del(`teams:user:${userId}`)
  await redis.del(`team:${invite.team_id}:members`)

  return { success: true }
}
```

---

### 4️⃣ 成员管理

```typescript
async function getMembers(teamId: number, userId: number) {
  // 1. 验证用户是团队成员
  const isMember = await teamRepository.checkMembership(teamId, userId)
  if (!isMember) {
    throw new Error('你不是该团队成员')
  }

  // 2. 尝试从缓存获取
  const cached = await redis.get(`team:${teamId}:members`)
  if (cached) {
    return JSON.parse(cached)
  }

  // 3. 从数据库查询
  const query = `
    SELECT
      u.id,
      u.username,
      u.email,
      u.avatar_url,
      tm.role,
      tm.joined_at
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = $1
    ORDER BY
      CASE tm.role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 3
      END,
      tm.joined_at
  `

  const result = await db.query(query, [teamId])

  const members = result.rows.map(row => ({
    id: row.id,
    username: row.username,
    email: row.email,
    avatar_url: row.avatar_url,
    role: row.role,
    joined_at: row.joined_at
  }))

  // 4. 缓存 10 分钟
  await redis.set(
    `team:${teamId}:members`,
    JSON.stringify(members),
    'EX',
    600
  )

  return members
}
```

---

### 5️⃣ 更新成员角色

```typescript
async function updateMemberRole(
  teamId: number,
  operatorId: number,
  targetUserId: number,
  newRole: TeamRole
) {
  // 1. 验证操作者权限 (仅 owner 可修改角色)
  const operatorRole = await teamRepository.getMemberRole(teamId, operatorId)
  if (operatorRole !== TeamRole.OWNER) {
    throw new Error('仅团队所有者可修改成员角色')
  }

  // 2. 不能修改自己的角色
  if (operatorId === targetUserId) {
    throw new Error('不能修改自己的角色')
  }

  // 3. 验证目标用户是成员
  const targetRole = await teamRepository.getMemberRole(teamId, targetUserId)
  if (!targetRole) {
    throw new Error('该用户不是团队成员')
  }

  // 4. 不能设置多个 owner
  if (newRole === TeamRole.OWNER) {
    throw new Error('每个团队只能有一个所有者')
  }

  // 5. 更新角色
  await teamRepository.updateRole(teamId, targetUserId, newRole)

  // 6. 清除缓存
  await redis.del(`team:${teamId}:members`)

  return { success: true }
}
```

---

### 6️⃣ 移除成员

```typescript
async function removeMember(
  teamId: number,
  operatorId: number,
  targetUserId: number
) {
  // 1. 获取操作者角色
  const operatorRole = await teamRepository.getMemberRole(teamId, operatorId)

  // 2. 获取目标用户角色
  const targetRole = await teamRepository.getMemberRole(teamId, targetUserId)

  // 3. 权限检查
  if (operatorId === targetUserId) {
    // 自己退出
    if (targetRole === TeamRole.OWNER) {
      throw new Error('团队所有者不能退出,请先转让所有权或删除团队')
    }
  } else {
    // 移除他人
    if (!hasPermission(operatorRole, 'remove_members')) {
      throw new Error('没有移除成员的权限')
    }

    // 不能移除 owner
    if (targetRole === TeamRole.OWNER) {
      throw new Error('不能移除团队所有者')
    }

    // admin 不能移除其他 admin
    if (operatorRole === TeamRole.ADMIN && targetRole === TeamRole.ADMIN) {
      throw new Error('管理员不能移除其他管理员')
    }
  }

  // 4. 移除成员
  await teamRepository.removeMember(teamId, targetUserId)

  // 5. 清除缓存
  await redis.del(`team:${teamId}:members`)
  await redis.del(`teams:user:${targetUserId}`)

  return { success: true }
}
```

---

### 7️⃣ 删除团队

```typescript
async function deleteTeam(teamId: number, userId: number) {
  // 1. 验证是 owner
  const role = await teamRepository.getMemberRole(teamId, userId)
  if (role !== TeamRole.OWNER) {
    throw new Error('仅团队所有者可删除团队')
  }

  // 2. 使用事务删除
  await db.transaction(async (trx) => {
    // 删除所有成员关联
    await trx.query('DELETE FROM team_members WHERE team_id = $1', [teamId])

    // 将团队链接归属个人
    await trx.query(
      'UPDATE short_links SET team_id = NULL WHERE team_id = $1',
      [teamId]
    )

    // 删除团队
    await trx.query('DELETE FROM teams WHERE id = $1', [teamId])
  })

  // 3. 清除所有相关缓存
  await redis.del(`team:${teamId}:members`)

  // 清除所有用户的团队列表缓存
  const pattern = 'teams:user:*'
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
| **角色权限** | 三级权限系统 (owner/admin/member) |
| **邀请验证** | 邮箱验证 + 一次性邀请码 |
| **权限检查** | 每个操作都验证用户权限 |
| **防护措施** | Owner 不能自己退出,不能被移除 |
| **事务保证** | 删除团队使用数据库事务 |

---

### ⚡ 性能优化

| 策略 | 效果 |
|------|------|
| **Redis 缓存** | 成员列表缓存 10 分钟 |
| **批量查询** | JOIN 查询减少 N+1 问题 |
| **邀请码存储** | Redis 存储,7 天自动过期 |
| **缓存清除** | 修改时清除相关缓存 |

---

### 📧 邀请邮件模板

```typescript
async function sendInviteEmail(
  email: string,
  data: {
    team_name: string
    inviter_name: string
    invite_link: string
    expires_in: string
  }
) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3B82F6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎉 你被邀请加入团队!</h2>
    <p><strong>${data.inviter_name}</strong> 邀请你加入团队 <strong>${data.team_name}</strong>。</p>
    <p>点击下方按钮接受邀请:</p>
    <a href="${data.invite_link}" class="button">接受邀请</a>
    <p>或复制链接到浏览器: <br>${data.invite_link}</p>
    <p style="color: #888; font-size: 14px;">该邀请将在 ${data.expires_in} 后过期。</p>
  </div>
</body>
</html>
  `

  await emailService.send({
    to: email,
    subject: `邀请你加入团队 ${data.team_name}`,
    html: htmlContent
  })
}
```

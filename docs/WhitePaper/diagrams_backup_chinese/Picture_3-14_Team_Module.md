# Picture 3-14: Team Module Diagram
# 图 3-14:团队模块图

```mermaid
graph TB
    subgraph "团队模块 Team Module"
        subgraph "控制器层 Controller Layer"
            TeamController[团队控制器<br>TeamController]
        end

        subgraph "服务层 Service Layer"
            TeamService[团队服务<br>TeamService]
            InviteService[邀请服务<br>InviteService]
            PermissionService[权限服务<br>PermissionService]
        end

        subgraph "仓储层 Repository Layer"
            TeamRepository[团队仓储<br>TeamRepository]
            MemberRepository[成员仓储<br>MemberRepository]
        end

        subgraph "工具组件 Utilities"
            InviteCodeGenerator[邀请码生成器<br>InviteCodeGenerator]
            RoleValidator[角色验证器<br>RoleValidator]
        end
    end

    Client([客户端])
    Database[(数据库)]
    Redis[(Redis)]
    EmailService[邮件服务]

    Client -->|POST /api/teams| TeamController
    Client -->|GET /api/teams| TeamController
    Client -->|POST /api/teams/:id/invite| TeamController
    Client -->|POST /api/teams/accept-invite| TeamController
    Client -->|GET /api/teams/:id/members| TeamController
    Client -->|PATCH /api/teams/:id/members/:uid| TeamController
    Client -->|DELETE /api/teams/:id/members/:uid| TeamController

    TeamController -->|团队管理| TeamService
    TeamController -->|邀请管理| InviteService
    TeamController -->|权限检查| PermissionService

    TeamService -->|操作团队| TeamRepository
    TeamService -->|操作成员| MemberRepository

    InviteService -->|生成邀请码| InviteCodeGenerator
    InviteService -->|发送邮件| EmailService
    InviteService -->|存储邀请| Redis

    PermissionService -->|验证角色| RoleValidator
    PermissionService -->|查询权限| MemberRepository

    TeamRepository -->|读写| Database
    MemberRepository -->|读写| Database
    TeamRepository -->|缓存| Redis

    style TeamController fill:#3B82F6,color:#fff
    style TeamService fill:#FFF9C4
    style InviteService fill:#FFCCBC
    style PermissionService fill:#FFCCBC
    style TeamRepository fill:#FFE0B2
    style MemberRepository fill:#FFE0B2
    style InviteCodeGenerator fill:#C8E6C9
    style RoleValidator fill:#C8E6C9
    style Database fill:#F8BBD0
    style Redis fill:#FFCCBC
    style EmailService fill:#EC4899
```

## 角色权限

| 角色 | 邀请成员 | 移除成员 | 修改角色 | 删除团队 |
|------|----------|----------|----------|----------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ❌ | ❌ |
| Member | ❌ | ❌ | ❌ | ❌ |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/teams | 创建团队 |
| GET | /api/teams | 获取用户团队列表 |
| POST | /api/teams/:id/invite | 邀请成员 |
| POST | /api/teams/accept-invite | 接受邀请 |
| GET | /api/teams/:id/members | 获取团队成员 |
| PATCH | /api/teams/:id/members/:uid | 更新成员角色 |
| DELETE | /api/teams/:id/members/:uid | 移除成员 |
| DELETE | /api/teams/:id | 删除团队 |

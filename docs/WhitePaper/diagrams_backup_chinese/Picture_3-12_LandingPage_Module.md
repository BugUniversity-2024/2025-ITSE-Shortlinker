# Picture 3-12: Landing Page Module Diagram
# 图 3-12:落地页模块图

```mermaid
graph TB
    subgraph "落地页模块 Landing Page Module"
        subgraph "控制器层 Controller Layer"
            LandingController[落地页控制器<br>LandingPageController]
            RenderController[渲染控制器<br>RenderController]
        end

        subgraph "服务层 Service Layer"
            LandingService[落地页服务<br>LandingPageService]
            TemplateService[模板服务<br>TemplateService]
            RenderService[渲染服务<br>RenderService]
        end

        subgraph "仓储层 Repository Layer"
            LandingRepository[落地页仓储<br>LandingPageRepository]
        end

        subgraph "工具组件 Utilities"
            DOMPurify[HTML清理器<br>DOMPurify]
            TemplateEngine[模板引擎<br>Template Engine]
        end
    end

    Client([客户端])
    Visitor([访客])
    Database[(数据库)]
    Redis[(Redis)]

    Client -->|GET /api/landing-pages/:id/editor| LandingController
    Client -->|PUT /api/landing-pages/:id| LandingController
    Client -->|POST /api/landing-pages/preview| LandingController
    Client -->|DELETE /api/landing-pages/:id| LandingController

    Visitor -->|GET /l/:short_code| RenderController

    LandingController -->|管理落地页| LandingService
    LandingController -->|加载模板| TemplateService

    RenderController -->|渲染页面| RenderService

    LandingService -->|清理HTML| DOMPurify
    LandingService -->|操作数据| LandingRepository

    TemplateService -->|渲染模板| TemplateEngine

    RenderService -->|查询内容| LandingRepository
    RenderService -->|构建HTML| RenderService

    LandingRepository -->|读写| Database
    LandingRepository -->|缓存| Redis

    style LandingController fill:#3B82F6,color:#fff
    style RenderController fill:#10B981,color:#fff
    style LandingService fill:#FFF9C4
    style TemplateService fill:#FFCCBC
    style RenderService fill:#FFCCBC
    style LandingRepository fill:#FFE0B2
    style DOMPurify fill:#EF4444
    style TemplateEngine fill:#C8E6C9
    style Database fill:#F8BBD0
    style Redis fill:#FFCCBC
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/landing-pages/:id/editor | 获取编辑器数据 |
| PUT | /api/landing-pages/:id | 更新落地页 |
| POST | /api/landing-pages/preview | 预览落地页 |
| DELETE | /api/landing-pages/:id | 删除落地页 |
| GET | /l/:short_code | 渲染落地页 |

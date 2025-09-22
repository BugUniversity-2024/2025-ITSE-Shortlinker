# 短链接系统后端 API

基于 FastAPI 构建的高性能短链接系统后端服务。

## 功能特性

### 🔐 用户认证系统
- 用户注册/登录
- JWT 令牌认证
- 密码安全加密
- 用户资料管理

### 🔗 链接管理
- 短链接创建和生成
- 批量链接创建
- 链接编辑和删除
- 自定义短码设置
- 链接过期时间管理

### 📊 数据分析
- 点击统计和趋势分析
- 地理位置分布
- 设备和浏览器分析
- 来源渠道统计

### 🔄 重定向服务
- 高性能链接重定向
- 访问记录统计
- 安全检查和验证

## 技术栈

- **框架**: FastAPI 0.104.1
- **数据库**: SQLite (SQLAlchemy ORM)
- **认证**: JWT + PassLib
- **API文档**: Swagger/OpenAPI
- **部署**: Uvicorn ASGI Server

## 快速开始

### 安装依赖
```bash
pip install -r requirements.txt
```

### 运行开发服务器
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 访问API文档
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
后端/
├── app/
│   ├── __init__.py
│   ├── main.py          # 应用入口
│   ├── database.py      # 数据库配置
│   ├── models/          # 数据模型
│   ├── schemas/         # Pydantic 模式
│   ├── crud/            # 数据库操作
│   ├── api/             # API 路由
│   ├── core/            # 核心配置
│   └── utils/           # 工具函数
├── tests/               # 测试文件
├── alembic/             # 数据库迁移
├── requirements.txt     # 依赖包
└── README.md           # 项目文档
```

## API 端点

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 链接管理
- `POST /api/links/create` - 创建短链接
- `GET /api/links` - 获取链接列表
- `PUT /api/links/{id}` - 更新链接
- `DELETE /api/links/{id}` - 删除链接

### 数据分析
- `GET /api/analytics/links/{id}` - 获取链接统计
- `GET /api/analytics/dashboard` - 仪表板数据

### 重定向
- `GET /{short_code}` - 短链接重定向

## 环境变量

创建 `.env` 文件：

```env
DATABASE_URL=sqlite:///./shortlink.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 部署

### Docker 部署
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 生产环境
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 许可证

MIT License
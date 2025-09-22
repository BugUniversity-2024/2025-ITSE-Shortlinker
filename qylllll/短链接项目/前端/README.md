# 短链接系统前端

基于 Vue 3 构建的现代化短链接管理系统前端应用。

## 📋 功能特性

### 🏠 首页模块
- 产品功能介绍
- 实时统计展示
- 演示功能体验
- 用户注册引导

### 🔐 用户认证
- 用户注册与邮箱验证
- 多种登录方式（邮箱/用户名）
- 密码强度验证
- 安全的会话管理

### 🔗 链接管理
- 短链接快速生成
- 批量链接创建
- 自定义短码设置
- 链接过期时间管理
- 标签分类组织
- 链接启用/禁用控制

### 📊 数据分析
- 点击统计与趋势分析
- 地理位置分布
- 设备类型统计
- 来源渠道分析
- 数据导出功能

### 👤 用户中心
- 个人资料管理
- 头像上传功能
- 密码安全设置
- 偏好配置
- 账户数据导出

### 🔄 智能重定向
- 安全的链接重定向
- 预览模式支持
- 恶意链接检测
- 访问统计记录

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 4.x
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI 框架**: Tailwind CSS 3.x
- **图标**: Heroicons
- **HTTP 客户端**: Axios
- **组件库**: Headless UI

## 📦 安装和运行

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── api/                 # API 接口层
│   ├── index.js        # Axios 实例配置
│   ├── auth.js         # 认证相关 API
│   ├── links.js        # 链接管理 API
│   └── analytics.js    # 数据分析 API
├── components/          # 公共组件
│   └── DashboardLayout.vue  # 仪表板布局
├── router/             # 路由配置
│   └── index.js        # 路由定义
├── stores/             # Pinia 状态管理
│   ├── auth.js         # 认证状态
│   └── links.js        # 链接状态
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Login.vue       # 登录页
│   ├── Register.vue    # 注册页
│   ├── Dashboard.vue   # 仪表板
│   ├── LinkGenerator.vue    # 链接生成器
│   ├── Analytics.vue   # 数据分析
│   ├── Profile.vue     # 用户资料
│   └── Redirect.vue    # 重定向处理
├── style.css           # 全局样式
├── main.js             # 应用入口
└── App.vue             # 根组件
```

## 🎨 设计系统

### 颜色主题
- **主色调**: 蓝色系 (#3B82F6)
- **辅助色**: 灰色系 (#64748B)
- **成功色**: 绿色 (#10B981)
- **警告色**: 黄色 (#F59E0B)
- **错误色**: 红色 (#EF4444)

### 响应式设计
- **移动优先**: 320px+
- **平板适配**: 768px+
- **桌面优化**: 1024px+
- **大屏支持**: 1920px+

## 🔧 配置说明

### 环境变量
创建 `.env` 文件并配置以下变量：

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=短链接系统
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

### API 代理配置
开发环境下，Vite 会自动代理 API 请求到后端服务器。

### Tailwind CSS 配置
自定义主题配置在 `tailwind.config.js` 中定义。

## 🚀 部署指南

### 静态部署
构建后的文件可以部署到任何静态文件服务器：
- Nginx
- Apache
- Vercel
- Netlify

### Docker 部署
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📝 开发规范

### 代码风格
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 官方风格指南
- 使用 Prettier 格式化代码

### 组件规范
- 使用 Composition API
- 采用 `<script setup>` 语法
- 组件名使用 PascalCase

### 提交规范
使用约定式提交格式：
```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建或工具相关
```

## 🔍 API 接口

### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/profile` - 获取用户信息
- `PUT /auth/profile` - 更新用户资料

### 链接管理
- `POST /links/create` - 创建短链接
- `GET /links` - 获取链接列表
- `PUT /links/:id` - 更新链接
- `DELETE /links/:id` - 删除链接

### 数据分析
- `GET /analytics/links/:id` - 获取链接统计
- `GET /analytics/dashboard` - 仪表板数据

## 🛡️ 安全特性

- JWT 令牌认证
- 请求拦截器自动处理认证
- 路由守卫保护私有页面
- CSRF 防护
- XSS 防护

## 🔧 故障排除

### 常见问题

1. **API 请求失败**
   - 检查后端服务是否启动
   - 验证 API 基础 URL 配置

2. **路由跳转异常**
   - 确认路由配置正确
   - 检查认证状态

3. **样式显示问题**
   - 检查 Tailwind CSS 是否正确配置
   - 确认 PostCSS 插件运行正常

### 调试技巧
- 使用 Vue DevTools 调试组件状态
- 利用浏览器网络面板检查 API 请求
- 查看控制台错误信息

## 📚 参考资料

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 构建工具](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia 状态管理](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)

## 📄 许可证

MIT License

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📞 支持

如有问题或建议，请：
- 提交 Issue
- 发送邮件至 support@example.com
- 查看项目文档

---

🎉 感谢使用短链接系统！
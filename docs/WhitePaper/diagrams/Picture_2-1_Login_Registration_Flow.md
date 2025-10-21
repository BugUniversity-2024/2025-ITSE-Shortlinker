# Picture 2-1: Business Process Models of Login and Registration
# 图 2-1：登录与注册的业务流程模型图

```mermaid
flowchart TD
    Start([开始 Start]) --> LoginPage[进入登录页面<br>Enter Login Page]
    LoginPage --> Choice{选择操作<br>Choose Action}

    Choice -->|注册 Register| RegForm[填写注册表单<br>Fill Registration Form]
    Choice -->|登录 Login| LoginForm[填写登录表单<br>Fill Login Form]

    RegForm --> ValidateReg{验证注册信息<br>Validate Registration}
    ValidateReg -->|验证失败<br>Invalid| RegError[显示错误信息<br>Show Error Message]
    RegError --> RegForm
    ValidateReg -->|验证成功<br>Valid| CreateUser[创建用户记录<br>Create User Record]
    CreateUser --> SendEmail[发送验证邮件<br>Send Verification Email]
    SendEmail --> VerifyEmail{点击邮件链接<br>Click Email Link}
    VerifyEmail -->|未验证<br>Not Verified| WaitVerify[等待验证<br>Wait for Verification]
    WaitVerify --> VerifyEmail
    VerifyEmail -->|已验证<br>Verified| LoginForm

    LoginForm --> ValidateLogin{验证登录信息<br>Validate Credentials}
    ValidateLogin -->|验证失败<br>Invalid| LoginError[显示错误信息<br>Show Error Message]
    LoginError --> LoginForm
    ValidateLogin -->|验证成功<br>Valid| GenerateToken[生成 JWT Token<br>Generate JWT Token]
    GenerateToken --> StoreFrontend[Token 存储到前端<br>Store Token in Frontend]
    StoreFrontend --> Dashboard[跳转到控制台<br>Redirect to Dashboard]
    Dashboard --> End([结束 End])

    style Start fill:#90EE90
    style End fill:#FFB6C1
    style ValidateReg fill:#FFE4B5
    style ValidateLogin fill:#FFE4B5
    style Dashboard fill:#87CEEB
```

## 流程说明

### 注册流程
1. 用户进入登录页面，选择注册
2. 填写注册表单（用户名、邮箱、密码）
3. 系统验证信息格式（邮箱格式、密码强度）
4. 验证成功后创建用户记录（密码使用 Argon2 哈希）
5. 发送验证邮件到用户邮箱
6. 用户点击邮件中的验证链接
7. 账户激活，返回登录页面

### 登录流程
1. 用户填写登录表单（邮箱/用户名 + 密码）
2. 系统验证凭据（密码哈希比对）
3. 验证成功后生成 JWT Token（Access Token 24h + Refresh Token 7d）
4. Token 存储到前端 LocalStorage
5. 跳转到控制台主页

### 错误处理
- 注册信息验证失败：重新填写
- 登录凭据错误：显示错误提示，限制每小时 5 次失败尝试

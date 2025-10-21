# Picture 2-4: Business Process Models of Short Link Creation and Management
# 图 2-4：短链接创建与管理的业务流程模型图

```mermaid
flowchart TD
    Start([开始 Start]) --> Dashboard[用户进入控制台<br>User Enters Dashboard]
    Dashboard --> ClickCreate[点击创建新链接<br>Click Create New Link]
    ClickCreate --> InputURL[输入原始 URL<br>Input Original URL]
    InputURL --> ValidateURL{验证 URL 格式<br>Validate URL}
    ValidateURL -->|无效 Invalid| URLError[显示错误提示<br>Show Error Message]
    URLError --> InputURL
    ValidateURL -->|有效 Valid| CodeChoice{短码类型选择<br>Short Code Type}

    CodeChoice -->|自定义 Custom| InputCustom[输入自定义短码<br>Input Custom Code]
    CodeChoice -->|随机生成 Random| GenerateCode[Base62 生成短码<br>Generate Base62 Code]

    InputCustom --> CheckCustom{检查自定义短码<br>Check Custom Code}
    CheckCustom -->|已存在 Exists| CustomError[短码已被占用<br>Code Already Taken]
    CustomError --> InputCustom
    CheckCustom -->|可用 Available| BloomCheck

    GenerateCode --> BloomCheck{Bloom Filter 检查<br>Bloom Filter Check}
    BloomCheck -->|可能冲突<br>Potential Collision| DBCheck{数据库查重<br>Database Check}
    DBCheck -->|确实冲突<br>Actual Collision| GenerateCode
    DBCheck -->|无冲突<br>No Collision| SaveDB
    BloomCheck -->|无冲突<br>No Collision| SaveDB[保存到数据库<br>Save to Database]

    SaveDB --> UpdateBloom[更新 Bloom Filter<br>Update Bloom Filter]
    UpdateBloom --> CacheRedis[缓存到 Redis<br>Cache to Redis]
    CacheRedis --> ConfigOptions{配置其他选项<br>Configure Options}

    ConfigOptions -->|设置过期时间<br>Set Expiration| SetExpiry[设置过期日期<br>Set Expiry Date]
    ConfigOptions -->|自定义域名<br>Custom Domain| SetDomain[配置自定义域名<br>Set Custom Domain]
    ConfigOptions -->|跳过配置<br>Skip| ShowResult

    SetExpiry --> ShowResult[显示短链接<br>Display Short Link]
    SetDomain --> ShowResult

    ShowResult --> CopyLink{操作选择<br>Choose Action}
    CopyLink -->|复制链接<br>Copy Link| CopySuccess[复制成功<br>Copy Success]
    CopyLink -->|生成 QR 码<br>Generate QR| QRCode[跳转 QR 生成<br>Go to QR Generation]
    CopyLink -->|创建落地页<br>Create Landing Page| LandingPage[跳转落地页编辑<br>Go to Landing Page Editor]
    CopyLink -->|完成<br>Done| End

    CopySuccess --> End([结束 End])
    QRCode --> End
    LandingPage --> End

    style Start fill:#90EE90
    style End fill:#FFB6C1
    style ValidateURL fill:#FFE4B5
    style BloomCheck fill:#E6E6FA
    style DBCheck fill:#E6E6FA
    style ShowResult fill:#87CEEB
```

## 流程说明

### 短链接创建流程
1. **输入原始 URL**：用户在表单中输入需要缩短的 URL
2. **URL 验证**：检查 URL 格式是否合法（支持 HTTP/HTTPS）
3. **短码生成**：
   - **随机生成**：使用 Base62 算法生成 6-8 位短码（包含 0-9, a-z, A-Z）
   - **自定义短码**：用户指定自己的短码（需检查可用性）
4. **冲突检测**：
   - 先通过 **Bloom Filter** 快速检查（O(1) 时间复杂度）
   - 如有潜在冲突，再查询数据库确认
   - 若确实冲突，重新生成短码
5. **数据存储**：
   - 保存到 **PostgreSQL** 数据库
   - 更新 **Bloom Filter**
   - 缓存到 **Redis**（TTL 24h）
6. **配置选项**：
   - 设置过期时间（可选）
   - 配置自定义域名（可选）
7. **展示结果**：显示生成的短链接，提供复制、QR 码生成、落地页创建等操作

### 关键技术点
- **Base62 编码**：62 个字符（0-9, a-z, A-Z），6 位可支持 568 亿个短码
- **Bloom Filter**：误判率 < 0.01%，大幅减少数据库查询
- **Redis 缓存**：确保重定向响应时间 < 100ms
- **冲突重试**：自动重新生成，无需用户干预

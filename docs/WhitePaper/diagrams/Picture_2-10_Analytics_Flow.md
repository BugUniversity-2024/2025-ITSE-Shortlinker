# Picture 2-10: Business Process Models of Click Statistics and Analysis
# 图 2-10：点击统计与分析的业务流程模型图

```mermaid
flowchart TD
    Start([开始 Start]) --> UserClick[用户访问短链接<br>User Clicks Short Link]
    UserClick --> Redirect[后端执行重定向<br>Backend Redirects]
    Redirect --> AsyncLog[异步记录点击日志<br>Async Log Click Event]

    AsyncLog --> ExtractData[提取访问信息<br>Extract Visit Data]
    ExtractData --> HashIP[IP 地址 SHA256 哈希<br>Hash IP with SHA256]
    HashIP --> ParseUA[解析 User-Agent<br>Parse User-Agent]
    ParseUA --> GeoIP[GeoIP 地理定位<br>GeoIP Location]
    GeoIP --> SaveLog[保存到 ClickLog 表<br>Save to ClickLog Table]
    SaveLog --> LogEnd([日志记录完成<br>Log Complete])

    Start2([用户查看分析<br>User Views Analytics]) --> Dashboard[进入分析仪表板<br>Enter Analytics Dashboard]
    Dashboard --> SelectLink[选择链接<br>Select Link]
    SelectLink --> SelectRange[选择时间范围<br>Select Date Range]
    SelectRange --> CheckCache{检查 Redis 缓存<br>Check Redis Cache}

    CheckCache -->|缓存命中<br>Cache Hit| ReturnCache[返回缓存数据<br>Return Cached Data]
    CheckCache -->|缓存未命中<br>Cache Miss| QueryDB[查询数据库<br>Query Database]

    QueryDB --> AggregateData[聚合统计数据<br>Aggregate Statistics]
    AggregateData --> ProcessGeo[处理地理数据<br>Process Geo Data]
    ProcessGeo --> ProcessDevice[处理设备数据<br>Process Device Data]
    ProcessDevice --> ProcessTime[处理时间趋势<br>Process Time Trends]
    ProcessTime --> CacheResult[缓存结果到 Redis<br>Cache Result to Redis]
    CacheResult --> ReturnResult

    ReturnCache --> ReturnResult[返回分析结果<br>Return Analytics Result]
    ReturnResult --> RenderCharts[渲染图表<br>Render Charts]

    RenderCharts --> ShowLineChart[折线图：时间趋势<br>Line Chart: Time Trends]
    RenderCharts --> ShowPieChart[饼图：设备分布<br>Pie Chart: Device Distribution]
    RenderCharts --> ShowMapChart[地图：地理分布<br>Map: Geographic Distribution]
    RenderCharts --> ShowBarChart[柱状图：浏览器/OS<br>Bar Chart: Browser/OS]

    ShowLineChart --> UserExport{用户操作<br>User Action}
    ShowPieChart --> UserExport
    ShowMapChart --> UserExport
    ShowBarChart --> UserExport

    UserExport -->|导出 CSV<br>Export CSV| ExportCSV[导出 CSV 文件<br>Export as CSV]
    UserExport -->|导出 JSON<br>Export JSON| ExportJSON[导出 JSON 文件<br>Export as JSON]
    UserExport -->|查看完成<br>Done| End

    ExportCSV --> End([结束 End])
    ExportJSON --> End

    style Start fill:#90EE90
    style Start2 fill:#90EE90
    style End fill:#FFB6C1
    style LogEnd fill:#FFB6C1
    style CheckCache fill:#E6E6FA
    style RenderCharts fill:#87CEEB
```

## 流程说明

### 📊 点击日志记录流程（异步）

#### 1. 点击事件触发
当用户访问短链接时（如 `https://tinybridge.link/aB3xY9`）：

1. **立即重定向**：后端从 Redis 缓存获取目标 URL，执行 302 重定向（< 100ms）
2. **异步日志**：不阻塞重定向，后台异步记录点击事件

#### 2. 数据采集与处理

```javascript
// 采集的数据
{
  link_id: 12345,
  clicked_at: '2025-01-15T14:32:10Z',
  ip_hash: SHA256(ip + daily_salt),  // 隐私保护
  user_agent: 'Mozilla/5.0...',
  referrer: 'https://weixin.qq.com',
  country: 'China',     // GeoIP 解析
  city: 'Guangzhou',    // GeoIP 解析
  device_type: 'mobile', // UA 解析
  browser: 'Chrome',    // UA 解析
  os: 'Android'         // UA 解析
}
```

#### 3. IP 隐私保护
- **SHA256 哈希**：IP + 每日轮换的 Salt
- **不可逆**：无法还原原始 IP
- **符合 GDPR/CCPA**：满足隐私法规要求
- **保留地理信息**：GeoIP 在哈希前解析

#### 4. GeoIP 地理定位
使用 `geoip-lite` 或 `@maxmind/geoip2-node`：
```javascript
const geoip = require('geoip-lite')
const geo = geoip.lookup('8.8.8.8')
// { country: 'US', region: 'CA', city: 'Mountain View' }
```

---

### 📈 数据分析查询流程

#### 1. 查询触发
用户进入分析仪表板，选择：
- **目标链接**：单个链接 or 全部链接
- **时间范围**：最近 7 天 / 30 天 / 自定义范围

#### 2. 缓存策略（Redis）
```
缓存 Key: analytics:link:{link_id}:range:{start}-{end}
TTL: 1 小时
```

- **缓存命中**：直接返回（< 50ms）
- **缓存未命中**：查询数据库 → 聚合计算 → 缓存结果

#### 3. 数据聚合

| 聚合维度 | 统计指标 | 图表类型 |
|----------|----------|----------|
| **时间趋势** | 每小时/每天点击数 | 折线图 |
| **地理分布** | 国家/城市点击数 | 地图 + 饼图 |
| **设备类型** | Mobile/Desktop/Tablet 占比 | 饼图 |
| **浏览器** | Chrome/Safari/Edge 占比 | 柱状图 |
| **操作系统** | Windows/macOS/Android/iOS | 柱状图 |
| **来源分析** | Direct/Social/Search 占比 | 饼图 |

#### 4. 图表渲染（ECharts/Chart.js）

```javascript
// 时间趋势折线图示例
{
  type: 'line',
  data: {
    labels: ['01-10', '01-11', '01-12', ...],
    datasets: [{
      label: '点击数 Clicks',
      data: [245, 389, 512, ...]
    }]
  }
}
```

#### 5. 数据导出
- **CSV 格式**：便于 Excel 分析
- **JSON 格式**：便于程序处理

---

### ⚡ 性能优化

| 优化策略 | 效果 |
|----------|------|
| **异步日志** | 不阻塞重定向，保持 < 100ms 响应 |
| **Redis 缓存** | 聚合数据缓存 1h，减少 DB 查询 |
| **数据库索引** | `link_id` + `clicked_at` 复合索引 |
| **批量插入** | 每 5 秒批量写入日志，减少 DB 连接 |

---

### 🔒 隐私合规

| 措施 | 说明 |
|------|------|
| **IP 哈希** | SHA256 + 每日轮换 Salt |
| **数据最小化** | 不存储个人身份信息 |
| **数据留存** | Click logs 保留 90 天 |
| **用户权利** | 支持数据导出、删除请求 |

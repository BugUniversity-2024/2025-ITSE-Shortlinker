# Picture 3-11: Analytics Module Sequence Diagram
# 图 3-11:分析模块序列图

```mermaid
sequenceDiagram
    participant Client as 客户端<br>Client
    participant Controller as 控制器<br>AnalyticsController
    participant Service as 服务层<br>AnalyticsService
    participant Repository as 仓储层<br>AnalyticsRepository
    participant Redis as Redis<br>缓存
    participant DB as PostgreSQL<br>数据库

    Note over Client,DB: 获取链接分析数据 Get Link Analytics

    Client->>Controller: GET /api/analytics/:link_id?range=7d
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Link Ownership

    Controller->>Service: getAnalytics(link_id, user_id, range)

    Service->>Service: 解析时间范围<br>Parse Date Range<br>(7d → start/end dates)

    Service->>Redis: GET analytics:{link_id}:range:{start}-{end}
    alt 缓存命中 Cache Hit
        Redis-->>Service: Cached Analytics Data
        Service-->>Controller: Analytics Result
        Controller-->>Client: 200 OK<br>{analytics: {...}}
    else 缓存未命中 Cache Miss
        Service->>Repository: getClickLogs(link_id, start_date, end_date)
        Repository->>DB: SELECT * FROM click_logs<br>WHERE link_id = ?<br>AND clicked_at BETWEEN ? AND ?<br>ORDER BY clicked_at
        DB-->>Repository: Click Logs Array
        Repository-->>Service: Raw Click Data

        Service->>Service: 聚合时间趋势<br>Aggregate Time Trends
        Service->>Service: 聚合地理分布<br>Aggregate Geographic Data
        Service->>Service: 聚合设备类型<br>Aggregate Device Types
        Service->>Service: 聚合浏览器/OS<br>Aggregate Browser/OS
        Service->>Service: 聚合来源分析<br>Aggregate Referrer Data

        Service->>Redis: SET analytics:{link_id}:range:{start}-{end}<br>aggregated_data<br>TTL: 1h
        Redis-->>Service: OK

        Service-->>Controller: Analytics Result
        Controller-->>Client: 200 OK<br>{analytics: {...}}
    end

    Note over Client,DB: 时间趋势聚合 Time Trends Aggregation

    Service->>Repository: aggregateByHour(link_id, start, end)
    Repository->>DB: SELECT<br>  DATE_TRUNC('hour', clicked_at) as hour,<br>  COUNT(*) as clicks<br>FROM click_logs<br>WHERE link_id = ?<br>  AND clicked_at BETWEEN ? AND ?<br>GROUP BY hour<br>ORDER BY hour
    DB-->>Repository: Hourly Clicks Data
    Repository-->>Service: [{hour: '2025-01-10 14:00', clicks: 245}, ...]

    Service->>Service: 格式化为图表数据<br>Format for Chart.js
    Service-->>Controller: {<br>  labels: ['14:00', '15:00', ...],<br>  data: [245, 389, ...]<br>}

    Note over Client,DB: 地理分布聚合 Geographic Distribution

    Service->>Repository: aggregateByCountry(link_id, start, end)
    Repository->>DB: SELECT<br>  country,<br>  city,<br>  COUNT(*) as clicks<br>FROM click_logs<br>WHERE link_id = ?<br>  AND clicked_at BETWEEN ? AND ?<br>GROUP BY country, city<br>ORDER BY clicks DESC<br>LIMIT 20
    DB-->>Repository: Geographic Data
    Repository-->>Service: [{country: 'China', city: 'Guangzhou', clicks: 1247}, ...]

    Service->>Service: 计算百分比<br>Calculate Percentages
    Service-->>Controller: {<br>  'China': {clicks: 2345, percentage: 45.2%},<br>  'USA': {clicks: 1234, percentage: 23.8%},<br>  ...<br>}

    Note over Client,DB: 设备类型聚合 Device Type Distribution

    Service->>Repository: aggregateByDevice(link_id, start, end)
    Repository->>DB: SELECT<br>  device_type,<br>  COUNT(*) as clicks<br>FROM click_logs<br>WHERE link_id = ?<br>  AND clicked_at BETWEEN ? AND ?<br>GROUP BY device_type
    DB-->>Repository: Device Data
    Repository-->>Service: [{device_type: 'mobile', clicks: 3456}, ...]

    Service->>Service: 计算占比<br>Calculate Distribution
    Service-->>Controller: {<br>  'mobile': 67.8%,<br>  'desktop': 28.5%,<br>  'tablet': 3.7%<br>}

    Note over Client,DB: 浏览器/操作系统聚合 Browser/OS Distribution

    Service->>Repository: aggregateByBrowser(link_id, start, end)
    Repository->>DB: SELECT<br>  browser,<br>  os,<br>  COUNT(*) as clicks<br>FROM click_logs<br>WHERE link_id = ?<br>  AND clicked_at BETWEEN ? AND ?<br>GROUP BY browser, os<br>ORDER BY clicks DESC
    DB-->>Repository: Browser/OS Data
    Repository-->>Service: [{browser: 'Chrome', os: 'Android', clicks: 2345}, ...]

    Service->>Service: 格式化数据<br>Format Data
    Service-->>Controller: {<br>  browsers: {Chrome: 45%, Safari: 30%, ...},<br>  os: {Android: 40%, iOS: 35%, ...}<br>}

    Note over Client,DB: 来源分析 Referrer Analysis

    Service->>Repository: aggregateByReferrer(link_id, start, end)
    Repository->>DB: SELECT<br>  CASE<br>    WHEN referrer IS NULL THEN 'Direct'<br>    WHEN referrer LIKE '%weixin%' THEN 'WeChat'<br>    WHEN referrer LIKE '%weibo%' THEN 'Weibo'<br>    WHEN referrer LIKE '%google%' THEN 'Search'<br>    ELSE 'Other'<br>  END as source,<br>  COUNT(*) as clicks<br>FROM click_logs<br>WHERE link_id = ?<br>  AND clicked_at BETWEEN ? AND ?<br>GROUP BY source<br>ORDER BY clicks DESC
    DB-->>Repository: Referrer Data
    Repository-->>Service: [{source: 'WeChat', clicks: 2345}, ...]

    Service->>Service: 计算占比<br>Calculate Percentages
    Service-->>Controller: {<br>  'WeChat': 45.2%,<br>  'Direct': 30.8%,<br>  'Weibo': 15.3%,<br>  ...<br>}

    Note over Client,DB: 导出分析数据 Export Analytics Data

    Client->>Controller: GET /api/analytics/:link_id/export?format=csv
    Controller->>Controller: 验证 JWT<br>Verify JWT
    Controller->>Controller: 验证权限<br>Verify Ownership

    Controller->>Service: exportAnalytics(link_id, user_id, format)

    Service->>Repository: getClickLogs(link_id, start, end)
    Repository->>DB: SELECT<br>  clicked_at,<br>  country,<br>  city,<br>  device_type,<br>  browser,<br>  os,<br>  referrer<br>FROM click_logs<br>WHERE link_id = ?<br>ORDER BY clicked_at DESC
    DB-->>Repository: Click Logs Array
    Repository-->>Service: Raw Data

    alt CSV 格式 CSV Format
        Service->>Service: 转换为 CSV<br>Convert to CSV
        Service-->>Controller: CSV String
        Controller-->>Client: 200 OK<br>Content-Type: text/csv<br>clicked_at,country,city,...<br>2025-01-10 14:32,China,Guangzhou,...
    else JSON 格式 JSON Format
        Service->>Service: 格式化 JSON<br>Format as JSON
        Service-->>Controller: JSON Array
        Controller-->>Client: 200 OK<br>Content-Type: application/json<br>[{clicked_at: '...', country: '...', ...}, ...]
    end

    Note over Client,DB: 实时统计 Real-time Statistics

    Client->>Controller: GET /api/analytics/:link_id/realtime
    Controller->>Controller: 验证 JWT<br>Verify JWT

    Controller->>Service: getRealtimeStats(link_id, user_id)

    Service->>Redis: GET realtime:{link_id}:last_5min
    alt 缓存存在 Cache Exists
        Redis-->>Service: Cached Stats
        Service-->>Controller: Realtime Stats
    else 缓存不存在 Cache Miss
        Service->>Repository: getClickLogs(link_id, last_5min)
        Repository->>DB: SELECT COUNT(*) as clicks<br>FROM click_logs<br>WHERE link_id = ?<br>  AND clicked_at >= NOW() - INTERVAL '5 minutes'
        DB-->>Repository: Click Count
        Repository-->>Service: Realtime Data

        Service->>Redis: SET realtime:{link_id}:last_5min<br>stats<br>TTL: 1min
        Redis-->>Service: OK

        Service-->>Controller: Realtime Stats
    end

    Controller-->>Client: 200 OK<br>{<br>  last_5min: 23,<br>  last_hour: 245,<br>  today: 1247<br>}

    style Client fill:#E3F2FD
    style Controller fill:#C8E6C9
    style Service fill:#FFF9C4
    style Repository fill:#FFE0B2
    style Redis fill:#FFCCBC
    style DB fill:#F8BBD0
```

## 模块说明

### 📊 分析模块核心功能

分析模块负责处理点击数据的聚合、可视化和导出，为用户提供深入的链接访问洞察。

---

### 1️⃣ 时间范围解析

```typescript
function parseDateRange(range: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = now
  let startDate: Date

  switch (range) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      // 自定义范围格式: "2025-01-01_2025-01-31"
      const [start, end] = range.split('_')
      startDate = new Date(start)
      endDate = new Date(end)
  }

  return { startDate, endDate }
}
```

---

### 2️⃣ 时间趋势聚合

```typescript
async function aggregateTimeTrends(
  linkId: number,
  startDate: Date,
  endDate: Date
): Promise<{ labels: string[]; data: number[] }> {
  // 根据时间范围选择聚合粒度
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const granularity = diffDays <= 2 ? 'hour' : 'day'

  // SQL 查询
  const query = `
    SELECT
      DATE_TRUNC('${granularity}', clicked_at) as time_bucket,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY time_bucket
    ORDER BY time_bucket
  `

  const result = await db.query(query, [linkId, startDate, endDate])

  // 格式化为图表数据
  const labels = result.rows.map(row => {
    const date = new Date(row.time_bucket)
    return granularity === 'hour'
      ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  })

  const data = result.rows.map(row => parseInt(row.clicks))

  return { labels, data }
}

// 示例输出
{
  labels: ['01-10', '01-11', '01-12', '01-13', '01-14', '01-15', '01-16'],
  data: [245, 389, 512, 678, 823, 1024, 1247]
}
```

---

### 3️⃣ 地理分布聚合

```typescript
async function aggregateGeographicData(
  linkId: number,
  startDate: Date,
  endDate: Date
) {
  // 国家级聚合
  const countryQuery = `
    SELECT
      country,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY country
    ORDER BY clicks DESC
    LIMIT 10
  `

  const countryResult = await db.query(countryQuery, [linkId, startDate, endDate])

  // 城市级聚合 (Top 20)
  const cityQuery = `
    SELECT
      country,
      city,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY country, city
    ORDER BY clicks DESC
    LIMIT 20
  `

  const cityResult = await db.query(cityQuery, [linkId, startDate, endDate])

  // 计算总点击数
  const totalClicks = countryResult.rows.reduce((sum, row) => sum + parseInt(row.clicks), 0)

  // 格式化数据
  const countries = countryResult.rows.map(row => ({
    country: row.country,
    clicks: parseInt(row.clicks),
    percentage: ((parseInt(row.clicks) / totalClicks) * 100).toFixed(1) + '%'
  }))

  const cities = cityResult.rows.map(row => ({
    country: row.country,
    city: row.city,
    clicks: parseInt(row.clicks)
  }))

  return {
    by_country: countries,
    by_city: cities
  }
}

// 示例输出
{
  by_country: [
    { country: 'China', clicks: 2345, percentage: '45.2%' },
    { country: 'USA', clicks: 1234, percentage: '23.8%' },
    { country: 'Japan', clicks: 678, percentage: '13.1%' }
  ],
  by_city: [
    { country: 'China', city: 'Guangzhou', clicks: 1247 },
    { country: 'China', city: 'Beijing', clicks: 678 },
    { country: 'USA', city: 'New York', clicks: 456 }
  ]
}
```

---

### 4️⃣ 设备类型聚合

```typescript
async function aggregateDeviceTypes(
  linkId: number,
  startDate: Date,
  endDate: Date
) {
  const query = `
    SELECT
      device_type,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY device_type
  `

  const result = await db.query(query, [linkId, startDate, endDate])

  const totalClicks = result.rows.reduce((sum, row) => sum + parseInt(row.clicks), 0)

  const distribution = {}
  result.rows.forEach(row => {
    const percentage = ((parseInt(row.clicks) / totalClicks) * 100).toFixed(1)
    distribution[row.device_type] = {
      clicks: parseInt(row.clicks),
      percentage: percentage + '%'
    }
  })

  return distribution
}

// 示例输出
{
  'mobile': { clicks: 3456, percentage: '67.8%' },
  'desktop': { clicks: 1452, percentage: '28.5%' },
  'tablet': { clicks: 189, percentage: '3.7%' }
}
```

---

### 5️⃣ 浏览器/操作系统聚合

```typescript
async function aggregateBrowserOS(
  linkId: number,
  startDate: Date,
  endDate: Date
) {
  // 浏览器聚合
  const browserQuery = `
    SELECT
      browser,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY browser
    ORDER BY clicks DESC
  `

  const browserResult = await db.query(browserQuery, [linkId, startDate, endDate])

  // 操作系统聚合
  const osQuery = `
    SELECT
      os,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY os
    ORDER BY clicks DESC
  `

  const osResult = await db.query(osQuery, [linkId, startDate, endDate])

  const totalClicks = browserResult.rows.reduce((sum, row) => sum + parseInt(row.clicks), 0)

  const browsers = {}
  browserResult.rows.forEach(row => {
    const percentage = ((parseInt(row.clicks) / totalClicks) * 100).toFixed(1)
    browsers[row.browser] = percentage + '%'
  })

  const operatingSystems = {}
  osResult.rows.forEach(row => {
    const percentage = ((parseInt(row.clicks) / totalClicks) * 100).toFixed(1)
    operatingSystems[row.os] = percentage + '%'
  })

  return {
    browsers,
    operating_systems: operatingSystems
  }
}

// 示例输出
{
  browsers: {
    'Chrome': '45.2%',
    'Safari': '30.8%',
    'WeChat Browser': '15.3%',
    'Firefox': '5.4%',
    'Edge': '3.3%'
  },
  operating_systems: {
    'Android': '40.5%',
    'iOS': '35.2%',
    'Windows': '15.8%',
    'macOS': '6.3%',
    'Linux': '2.2%'
  }
}
```

---

### 6️⃣ 来源分析

```typescript
async function aggregateReferrers(
  linkId: number,
  startDate: Date,
  endDate: Date
) {
  const query = `
    SELECT
      CASE
        WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
        WHEN referrer LIKE '%weixin%' OR referrer LIKE '%wechat%' THEN 'WeChat'
        WHEN referrer LIKE '%weibo%' THEN 'Weibo'
        WHEN referrer LIKE '%douyin%' OR referrer LIKE '%tiktok%' THEN 'TikTok'
        WHEN referrer LIKE '%google%' THEN 'Google Search'
        WHEN referrer LIKE '%baidu%' THEN 'Baidu Search'
        WHEN referrer LIKE '%facebook%' THEN 'Facebook'
        WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'Twitter/X'
        ELSE 'Other'
      END as source,
      COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    GROUP BY source
    ORDER BY clicks DESC
  `

  const result = await db.query(query, [linkId, startDate, endDate])

  const totalClicks = result.rows.reduce((sum, row) => sum + parseInt(row.clicks), 0)

  const sources = {}
  result.rows.forEach(row => {
    const percentage = ((parseInt(row.clicks) / totalClicks) * 100).toFixed(1)
    sources[row.source] = {
      clicks: parseInt(row.clicks),
      percentage: percentage + '%'
    }
  })

  return sources
}

// 示例输出
{
  'WeChat': { clicks: 2345, percentage: '45.2%' },
  'Direct': { clicks: 1598, percentage: '30.8%' },
  'Weibo': { clicks: 793, percentage: '15.3%' },
  'Google Search': { clicks: 280, percentage: '5.4%' },
  'Other': { clicks: 171, percentage: '3.3%' }
}
```

---

### 7️⃣ 数据导出

```typescript
import { Parser } from 'json2csv'

async function exportAnalytics(
  linkId: number,
  userId: number,
  format: 'csv' | 'json',
  startDate: Date,
  endDate: Date
) {
  // 1. 查询原始数据
  const query = `
    SELECT
      clicked_at,
      country,
      city,
      device_type,
      browser,
      os,
      referrer
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at BETWEEN $2 AND $3
    ORDER BY clicked_at DESC
  `

  const result = await db.query(query, [linkId, startDate, endDate])

  if (format === 'csv') {
    // 转换为 CSV
    const fields = ['clicked_at', 'country', 'city', 'device_type', 'browser', 'os', 'referrer']
    const parser = new Parser({ fields })
    const csv = parser.parse(result.rows)
    return csv
  } else {
    // 返回 JSON
    return result.rows
  }
}
```

---

### 8️⃣ 实时统计

```typescript
async function getRealtimeStats(linkId: number) {
  const now = new Date()

  // 最近 5 分钟
  const last5MinQuery = `
    SELECT COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at >= $2
  `
  const last5Min = await db.query(last5MinQuery, [
    linkId,
    new Date(now.getTime() - 5 * 60 * 1000)
  ])

  // 最近 1 小时
  const lastHourQuery = `
    SELECT COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at >= $2
  `
  const lastHour = await db.query(lastHourQuery, [
    linkId,
    new Date(now.getTime() - 60 * 60 * 1000)
  ])

  // 今天
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayQuery = `
    SELECT COUNT(*) as clicks
    FROM click_logs
    WHERE link_id = $1
      AND clicked_at >= $2
  `
  const today = await db.query(todayQuery, [linkId, todayStart])

  return {
    last_5min: parseInt(last5Min.rows[0].clicks),
    last_hour: parseInt(lastHour.rows[0].clicks),
    today: parseInt(today.rows[0].clicks)
  }
}
```

---

### 🔒 缓存策略

| 缓存类型 | Key 格式 | TTL | 说明 |
|----------|----------|-----|------|
| **聚合分析数据** | `analytics:{link_id}:range:{start}-{end}` | 1h | 完整的分析结果 |
| **实时统计** | `realtime:{link_id}:last_5min` | 1min | 实时统计数据 |
| **导出数据** | 不缓存 | - | 每次查询数据库 |

---

### ⚡ 性能优化

| 策略 | 效果 |
|------|------|
| **数据库索引** | `(link_id, clicked_at)` 复合索引 |
| **聚合缓存** | Redis 缓存 1 小时,减少 90% 查询 |
| **分区表** | 按月分区 `click_logs`,提升查询速度 |
| **数据归档** | 90 天后归档到冷存储 |
| **异步聚合** | 夜间预聚合常用时间范围 |

---

### 📈 图表渲染示例

```typescript
// 前端使用 Chart.js 渲染
const timeChartConfig = {
  type: 'line',
  data: {
    labels: analytics.time_trends.labels,
    datasets: [{
      label: '点击数',
      data: analytics.time_trends.data,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
}

const devicePieConfig = {
  type: 'pie',
  data: {
    labels: ['Mobile', 'Desktop', 'Tablet'],
    datasets: [{
      data: [67.8, 28.5, 3.7],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ]
    }]
  }
}
```

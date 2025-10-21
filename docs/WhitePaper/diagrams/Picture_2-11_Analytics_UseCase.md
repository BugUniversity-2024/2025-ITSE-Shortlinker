# Picture 2-11: Use Case Diagram of Click Statistics and Analysis
# 图 2-11:点击统计与分析的用例图

```mermaid
graph TB
    User([用户<br>User])
    Visitor([访客<br>Visitor])

    subgraph "数据分析系统<br>Analytics System"
        ViewDashboard[查看分析面板<br>View Dashboard]
        ViewTimeTrends[查看时间趋势<br>View Time Trends]
        ViewGeoDistribution[查看地理分布<br>View Geographic Distribution]
        ViewDeviceStats[查看设备统计<br>View Device Stats]
        ViewReferrerAnalysis[查看来源分析<br>View Referrer Analysis]
        ExportData[导出数据<br>Export Data]
        SelectDateRange[选择日期范围<br>Select Date Range]
    end

    ClickLogger[点击日志记录器<br>Click Logger]
    GeoIP[GeoIP服务<br>GeoIP Service]
    Database[(数据库<br>Database)]
    Redis[(Redis<br>缓存)]

    User -->|查看面板| ViewDashboard
    User -->|查看趋势| ViewTimeTrends
    User -->|查看分布| ViewGeoDistribution
    User -->|查看统计| ViewDeviceStats
    User -->|查看来源| ViewReferrerAnalysis
    User -->|导出| ExportData

    Visitor -->|访问链接| ClickLogger

    ViewDashboard ..>|包含| ViewTimeTrends
    ViewDashboard ..>|包含| ViewGeoDistribution
    ViewDashboard ..>|包含| ViewDeviceStats
    ViewDashboard ..>|包含| ViewReferrerAnalysis

    ViewTimeTrends ..>|可选| SelectDateRange
    ViewGeoDistribution ..>|可选| SelectDateRange

    ClickLogger -->|哈希IP| ClickLogger
    ClickLogger -->|解析UA| ClickLogger
    ClickLogger -->|地理定位| GeoIP
    ClickLogger -->|写入日志| Database

    ViewDashboard -->|查询缓存| Redis
    ViewDashboard -.->|缓存未命中| Database

    ExportData -->|查询日志| Database
    ExportData -->|生成CSV/JSON| ExportData

    style User fill:#10B981,color:#fff
    style Visitor fill:#F59E0B,color:#fff
    style ViewDashboard fill:#3B82F6,color:#fff
    style ViewTimeTrends fill:#8B5CF6,color:#fff
    style ViewGeoDistribution fill:#8B5CF6,color:#fff
    style ViewDeviceStats fill:#8B5CF6,color:#fff
    style ViewReferrerAnalysis fill:#8B5CF6,color:#fff
    style ExportData fill:#EC4899,color:#fff
    style SelectDateRange fill:#F59E0B,color:#fff
    style ClickLogger fill:#EF4444,color:#fff
    style GeoIP fill:#EC4899,color:#fff
    style Database fill:#6366F1,color:#fff
    style Redis fill:#EF4444,color:#fff
```

## 用例说明

### 核心流程

#### 1. 点击日志记录 (异步后台)
```
访客访问短链接
    ↓
系统重定向 (不阻塞)
    ↓
异步记录点击日志:
  - 提取 IP → SHA256 哈希
  - 解析 User-Agent → 设备/浏览器/OS
  - GeoIP 定位 → 国家/城市
  - 写入 click_logs 表
```

#### 2. 分析查询 (用户主动)
```
用户打开分析面板
    ↓
查询 Redis 缓存 (TTL: 1h)
    ├── 缓存命中 → 返回数据
    └── 缓存未命中
            ↓
        查询数据库并聚合
            ↓
        写入 Redis 缓存
            ↓
        返回数据
```

---

### 分析维度

#### 1. 时间趋势 (View Time Trends)
- **按小时聚合**: 适用于最近 24-48 小时
- **按天聚合**: 适用于最近 7-30 天
- **按周聚合**: 适用于最近 3-6 个月
- **按月聚合**: 适用于全年数据

**可视化**: 折线图 (Chart.js Line Chart)

#### 2. 地理分布 (View Geographic Distribution)
- **国家分布**: Top 10 国家
- **城市分布**: Top 20 城市
- **可视化**: 饼图 + 地图热力图

#### 3. 设备统计 (View Device Stats)
- **设备类型**: Mobile / Desktop / Tablet
- **浏览器**: Chrome / Safari / Firefox / Edge
- **操作系统**: Android / iOS / Windows / macOS / Linux
- **可视化**: 饼图

#### 4. 来源分析 (View Referrer Analysis)
- **直接访问**: 无 Referrer
- **社交媒体**: WeChat / Weibo / TikTok
- **搜索引擎**: Google / Baidu
- **其他**: 其他网站
- **可视化**: 条形图

---

### 数据导出

**支持格式**:
- **CSV**: 适合 Excel/Google Sheets
- **JSON**: 适合程序处理

**导出内容**:
```csv
clicked_at,country,city,device_type,browser,os,referrer
2025-01-10 14:32:15,China,Guangzhou,mobile,Chrome,Android,WeChat
2025-01-10 14:35:22,USA,New York,desktop,Safari,macOS,Direct
...
```

---

### 隐私保护

✅ **IP 匿名化**: SHA256 + 每日轮换 Salt
✅ **不可逆**: 无法从哈希反推原始 IP
✅ **GDPR 合规**: 符合欧盟隐私法规
✅ **CCPA 合规**: 符合加州消费者隐私法案

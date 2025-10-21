# Picture 3-10: Analytics Module Diagram
# 图 3-10:分析模块图

```mermaid
graph TB
    subgraph "分析模块 Analytics Module"
        subgraph "控制器层 Controller Layer"
            AnalyticsController[分析控制器<br>AnalyticsController]
        end

        subgraph "服务层 Service Layer"
            AnalyticsService[分析服务<br>AnalyticsService]
            DataAggregator[数据聚合器<br>DataAggregator]
            ExportService[导出服务<br>ExportService]
        end

        subgraph "仓储层 Repository Layer"
            ClickLogRepository[点击日志仓储<br>ClickLogRepository]
        end

        subgraph "工具组件 Utilities"
            GeoIPParser[GeoIP解析器<br>GeoIP Parser]
            UAParser[UA解析器<br>User-Agent Parser]
            ChartFormatter[图表格式化<br>Chart Formatter]
            CSVExporter[CSV导出器<br>CSV Exporter]
        end
    end

    Client([客户端])
    Database[(数据库)]
    Redis[(Redis)]

    Client -->|GET /api/analytics/:id| AnalyticsController
    Client -->|GET /api/analytics/:id/export| AnalyticsController

    AnalyticsController -->|获取分析| AnalyticsService
    AnalyticsController -->|导出数据| ExportService

    AnalyticsService -->|聚合数据| DataAggregator
    AnalyticsService -->|查询日志| ClickLogRepository
    AnalyticsService -->|格式化| ChartFormatter

    DataAggregator -->|按时间| DataAggregator
    DataAggregator -->|按地理| DataAggregator
    DataAggregator -->|按设备| DataAggregator

    ExportService -->|查询| ClickLogRepository
    ExportService -->|生成CSV| CSVExporter

    ClickLogRepository -->|读取| Database
    ClickLogRepository -->|缓存| Redis

    style AnalyticsController fill:#3B82F6,color:#fff
    style AnalyticsService fill:#FFF9C4
    style DataAggregator fill:#FFCCBC
    style ExportService fill:#FFCCBC
    style ClickLogRepository fill:#FFE0B2
    style GeoIPParser fill:#C8E6C9
    style UAParser fill:#C8E6C9
    style ChartFormatter fill:#C8E6C9
    style CSVExporter fill:#C8E6C9
    style Database fill:#F8BBD0
    style Redis fill:#FFCCBC
```

## 数据聚合维度

### 1. 时间趋势聚合
```sql
SELECT
  DATE_TRUNC('hour', clicked_at) as time_bucket,
  COUNT(*) as clicks
FROM click_logs
WHERE link_id = ? AND clicked_at BETWEEN ? AND ?
GROUP BY time_bucket
ORDER BY time_bucket
```

### 2. 地理分布聚合
```sql
SELECT
  country,
  city,
  COUNT(*) as clicks
FROM click_logs
WHERE link_id = ?
GROUP BY country, city
ORDER BY clicks DESC
LIMIT 20
```

### 3. 设备类型聚合
```sql
SELECT
  device_type,
  COUNT(*) as clicks
FROM click_logs
WHERE link_id = ?
GROUP BY device_type
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/analytics/:id | 获取链接分析数据 |
| GET | /api/analytics/:id/realtime | 获取实时统计 |
| GET | /api/analytics/:id/export | 导出CSV/JSON |

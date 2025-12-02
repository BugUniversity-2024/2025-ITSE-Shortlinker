export interface AnalyticsSummary {
  total_clicks: number
  unique_clicks: number
  peak_hour: string
  peak_day: string
}

export interface TimeSeriesData {
  date: string
  clicks: number
  unique_clicks: number
}

export interface GeographicData {
  country: string
  city?: string
  clicks: number
  percentage: number
}

export interface DeviceData {
  type: 'mobile' | 'tablet' | 'desktop' | 'other'
  clicks: number
  percentage: number
}

export interface BrowserData {
  browser: string
  clicks: number
  percentage: number
}

export interface OSData {
  os: string
  clicks: number
  percentage: number
}

export interface ReferrerData {
  source: string
  clicks: number
  percentage: number
}

export interface LinkAnalytics {
  summary: AnalyticsSummary
  time_series: TimeSeriesData[]
  geographic: GeographicData[]
  devices: DeviceData[]
  browsers: BrowserData[]
  operating_systems: OSData[]
  referrers: ReferrerData[]
}

export interface DashboardStats {
  total_links: number
  total_clicks: number
  today_clicks: number
  growth_rate: number
  recent_links: Array<{
    id: number
    short_code: string
    original_url: string
    click_count: number
    created_at: string
  }>
}

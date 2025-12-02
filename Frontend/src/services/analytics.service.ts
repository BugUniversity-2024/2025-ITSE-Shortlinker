import api from './api'
import type { LinkAnalytics, DashboardStats } from '@/types'

export interface AnalyticsParams {
  start_date?: string
  end_date?: string
  period?: 'day' | 'week' | 'month'
}

export const analyticsService = {
  // 获取链接统计数据
  async getLinkAnalytics(linkId: number, params: AnalyticsParams = {}): Promise<LinkAnalytics> {
    const response = await api.get<LinkAnalytics>(`/analytics/links/${linkId}`, { params })
    return response.data
  },

  // 获取用户仪表板数据
  async getDashboard(params: AnalyticsParams = {}): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/analytics/dashboard', { params })
    return response.data
  },

  // 导出统计数据
  async exportAnalytics(linkId: number, params: { format?: 'csv' | 'json' } = {}): Promise<Blob> {
    const response = await api.get(`/analytics/export/${linkId}`, {
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

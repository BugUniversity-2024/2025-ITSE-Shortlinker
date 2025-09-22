import api from './index'

export const analyticsAPI = {
  // 获取链接统计数据
  getLinkAnalytics: (linkId, params = {}) => {
    return api.get(`/analytics/links/${linkId}`, { params })
  },

  // 获取用户仪表板数据
  getDashboard: (params = {}) => {
    return api.get('/analytics/dashboard', { params })
  },

  // 导出统计数据
  exportAnalytics: (linkId, params = {}) => {
    return api.get(`/analytics/export/${linkId}`, {
      params,
      responseType: 'blob'
    })
  }
}
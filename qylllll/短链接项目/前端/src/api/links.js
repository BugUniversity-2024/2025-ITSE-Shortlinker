import api from './index'

export const linksAPI = {
  // 创建短链接
  createLink: (linkData) => {
    return api.post('/links/create', linkData)
  },

  // 批量创建短链接
  batchCreateLinks: (linksData) => {
    return api.post('/links/batch', linksData)
  },

  // 获取用户链接列表
  getLinks: (params = {}) => {
    return api.get('/links/', { params })
  },

  // 获取单个链接详情
  getLinkById: (linkId) => {
    return api.get(`/links/${linkId}`)
  },

  // 获取链接信息（通过短码）
  getLinkByCode: (shortCode) => {
    return api.get(`/links/info/${shortCode}`)
  },

  // 更新链接
  updateLink: (linkId, linkData) => {
    return api.put(`/links/${linkId}`, linkData)
  },

  // 删除链接
  deleteLink: (linkId) => {
    return api.delete(`/links/${linkId}`)
  },

  // 更新链接状态
  updateLinkStatus: (linkId, status) => {
    return api.post(`/links/${linkId}/toggle-status`, { status })
  },

  // 获取二维码
  getQRCode: (shortCode, params = {}) => {
    return api.get(`/qr/${shortCode}`, {
      params,
      responseType: 'blob'
    })
  },

  // 获取链接信息用于重定向
  getLinkInfo: (shortCode) => {
    return api.get(`/redirect/${shortCode}`)
  },

  // 记录点击
  recordClick: (shortCode, clickData) => {
    return api.post(`/redirect/${shortCode}/click`, clickData)
  }
}
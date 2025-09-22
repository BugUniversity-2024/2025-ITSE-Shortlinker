import api from './index'

export const authAPI = {
  // 用户注册
  register: (userData) => {
    return api.post('/auth/register', userData)
  },

  // 用户登录
  login: (credentials) => {
    // OAuth2标准需要form-data格式
    const params = new URLSearchParams()
    params.append('username', credentials.username)
    params.append('password', credentials.password)
    
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  // 获取用户信息
  getProfile: () => {
    return api.get('/auth/profile')
  },

  // 获取API密钥
  getApiKey: () => {
    return api.get('/auth/api-key')
  },

  // 刷新令牌
  refreshToken: () => {
    return api.post('/auth/refresh')
  },

  // 修改密码
  changePassword: (passwordData) => {
    return api.post('/auth/change-password', passwordData)
  },

  // 更新用户资料
  updateProfile: (profileData) => {
    return api.put('/auth/profile', profileData)
  },

  // 获取用户设置
  getSettings: () => {
    return api.get('/auth/settings')
  },

  // 更新用户设置
  updateSettings: (settings) => {
    return api.put('/auth/settings', settings)
  },

  // 获取用户统计信息
  getUserStats: () => {
    return api.get('/auth/stats')
  },

  // 导出用户数据
  exportUserData: () => {
    return api.get('/auth/export', {
      responseType: 'blob'
    })
  },

  // 删除账户
  deleteAccount: (data) => {
    return api.delete('/auth/account', { data })
  }
}
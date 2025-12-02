import api from './api'
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserSettings,
  UserStats,
  ChangePasswordData
} from '@/types'

export const authService = {
  // 用户注册
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  // 用户登录 (OAuth2 form-data 格式)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const params = new URLSearchParams()
    params.append('username', credentials.username)
    params.append('password', credentials.password)

    const response = await api.post<AuthResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  },

  // 获取用户信息
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },

  // 更新用户资料
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data)
    return response.data
  },

  // 获取 API 密钥
  async getApiKey(): Promise<{ api_key: string }> {
    const response = await api.get<{ api_key: string }>('/auth/api-key')
    return response.data
  },

  // 刷新令牌
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh')
    return response.data
  },

  // 修改密码
  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.post('/auth/change-password', data)
  },

  // 获取用户设置
  async getSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettings>('/auth/settings')
    return response.data
  },

  // 更新用户设置
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/auth/settings', settings)
    return response.data
  },

  // 获取用户统计信息
  async getUserStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/auth/stats')
    return response.data
  },

  // 导出用户数据
  async exportUserData(): Promise<Blob> {
    const response = await api.get('/auth/export', {
      responseType: 'blob'
    })
    return response.data
  },

  // 删除账户
  async deleteAccount(data: { password: string }): Promise<void> {
    await api.delete('/auth/account', { data })
  }
}
